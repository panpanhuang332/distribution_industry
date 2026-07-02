#!/usr/bin/env bash
# ============================================================================
# smoke_test.sh — Phase 1 live 驗收（需要「可連外」的本機環境）
#
# 對 Crossref 做真實抓取（非 fixture），驗證 fetch_and_score.py 端到端可用，
# 並報告各期刊的抓取量與「摘要覆蓋率」（Elsevier 期刊在 Crossref 常無摘要）。
#
# 用法：
#   ./smoke_test.sh                      # 預設 3 本：JSR / JM / JBR（含一本 Elsevier）
#   ./smoke_test.sh 1094-6705 0022-2429  # 自訂 ISSN 清單
#   MIN_PER_JOURNAL=1 ./smoke_test.sh    # 調整每期刊最低筆數門檻
#
# 通過標準（PASS）：
#   1. fetch_and_score.py 正常結束（exit 0），無未處理例外。
#   2. 每本期刊回傳筆數 >= MIN_PER_JOURNAL（預設 1）。
#      註：季刊（如 MIS Quarterly）30 天視窗內可能為 0，屬正常；
#          若測這類期刊請把該 ISSN 移出或設 MIN_PER_JOURNAL=0。
#   3. 去重有作用且入庫：total_fetched >= new_this_run 且 new_this_run > 0（首次跑）。
#   摘要覆蓋率僅「報告」，不作為硬性失敗條件（Elsevier 天生低覆蓋）。
# ============================================================================
set -uo pipefail
cd "$(dirname "$0")"

ISSNS=("$@")
if [ ${#ISSNS[@]} -eq 0 ]; then
  ISSNS=("1094-6705" "0022-2429" "0148-2963")  # JSR, JM, JBR(Elsevier)
fi
MIN_PER_JOURNAL="${MIN_PER_JOURNAL:-1}"

ARGS=()
for issn in "${ISSNS[@]}"; do ARGS+=(--issn "$issn"); done

SUMMARY_FILE="$(mktemp)"
echo ">>> live 抓取 ISSN: ${ISSNS[*]}（MIN_PER_JOURNAL=$MIN_PER_JOURNAL）"
echo ">>> 首次執行前清空既有 DB 以驗證去重入庫..."
rm -f data/scholar_radar.db data/papers.json

set +e
python3 fetch_and_score.py "${ARGS[@]}" -v > "$SUMMARY_FILE"
RC=$?
set -e 2>/dev/null || true

if [ $RC -ne 0 ]; then
  echo "!!! FAIL：fetch_and_score.py 退出碼 $RC（有未處理例外或網路失敗）"
  cat "$SUMMARY_FILE"
  rm -f "$SUMMARY_FILE"
  exit 1
fi

python3 - "$SUMMARY_FILE" "$MIN_PER_JOURNAL" <<'PY'
import json, sys
summary = json.load(open(sys.argv[1], encoding="utf-8"))
min_per = int(sys.argv[2])

print("\n================ Phase 1 live smoke 報告 ================")
print(f"抓取視窗 : {summary['from_date']} 起 {summary['window_days']} 天，filter={summary['filter_field']}")
print(f"總抓取   : {summary['total_fetched']}（丟棄過舊 {summary.get('total_dropped_stale',0)}）")
print(f"本次新增 : {summary['new_this_run']}")
print(f"整體摘要覆蓋率: {summary.get('abstract_coverage_overall',0)*100:.0f}%\n")

print(f"{'ISSN':<12}{'期刊':<40}{'抓取':>5}{'新增':>5}{'摘要覆蓋率':>10}")
print("-"*76)
failures, warnings = [], []
for pj in summary.get("per_journal", []):
    cov = pj["abstract_coverage"]*100
    print(f"{pj['issn']:<12}{pj['name'][:38]:<40}{pj['fetched']:>5}{pj['new']:>5}{cov:>9.0f}%")
    if pj["fetched"] < min_per:
        failures.append(f"{pj['name']} ({pj['issn']}) 只回傳 {pj['fetched']} 筆 < {min_per}")
    if pj["fetched"] > 0 and cov < 40:
        warnings.append(f"{pj['name']} 摘要覆蓋率僅 {cov:.0f}%（Crossref 缺摘要）")
print("-"*76)

# 通過標準 3：去重有作用且首次入庫
if summary["total_fetched"] < summary["new_this_run"]:
    failures.append("total_fetched < new_this_run（去重/計數異常）")
if summary["new_this_run"] == 0 and summary["total_fetched"] > 0:
    failures.append("抓到資料但入庫 0 筆（去重可能誤刪或寫入失敗）")

for w in warnings:
    print(f"[WARN] {w}")
if failures:
    print("\n!!! FAIL：")
    for f in failures:
        print(f"   - {f}")
    sys.exit(1)
print("\n=== PASS：Phase 1 live 驗收通過 ===")
if warnings:
    print("（有低摘要覆蓋率警告 → 見 README「摘要覆蓋率評估」，考慮啟動 Phase 2.5）")
PY
RC=$?

# 冪等性檢查：再跑一次，new_this_run 應為 0
if [ $RC -eq 0 ]; then
  echo ""
  echo ">>> 冪等性檢查：重跑一次，預期新增 0 筆..."
  SECOND="$(mktemp)"
  python3 fetch_and_score.py "${ARGS[@]}" > "$SECOND" 2>/dev/null
  NEW2=$(python3 -c "import json,sys;print(json.load(open('$SECOND'))['new_this_run'])")
  if [ "$NEW2" = "0" ]; then
    echo "    OK：重跑新增 0 筆（去重冪等）"
  else
    echo "!!! FAIL：重跑仍新增 $NEW2 筆（非冪等）"
    RC=1
  fi
  rm -f "$SECOND"
fi

rm -f "$SUMMARY_FILE"
exit $RC
