# `orders` 테이블 SQL 예시

## 실행 전 전제

- 테이블 이름은 `orders`이고 컬럼은 `주문번호`, `주문일`, `고객명`, `도시`, `상품`, `수량`, `단가`, `채널`이다.
- 날짜는 `YYYY-MM-DD`, 도시와 상품명은 기준 표기로 정리되어 있다고 가정한다.
- 원본 `practice/ko/orders.csv`를 그대로 넣으면 날짜·상품 표기 혼용과 중복 때문에 결과가 조용히 달라질 수 있으므로 `orders-clean.csv` 수준으로 먼저 정제한다.

## 1. 상품별 매출 내림차순

```sql
SELECT
    "상품",
    SUM("수량" * "단가") AS "매출"
FROM orders
WHERE "수량" > 0
  AND "단가" IS NOT NULL
GROUP BY "상품"
ORDER BY "매출" DESC;
```

**쉬운 설명:** 수량과 단가가 정상인 주문의 매출을 상품별로 더한 뒤 가장 많이 팔린 상품부터 보여준다.

## 2. 2026년 8월 채널별 주문 수

```sql
SELECT
    "채널",
    COUNT(DISTINCT "주문번호") AS "주문수"
FROM orders
WHERE "주문일" >= '2026-08-01'
  AND "주문일" < '2026-09-01'
GROUP BY "채널"
ORDER BY "주문수" DESC;
```

**쉬운 설명:** 2026년 8월에 들어온 고유 주문을 채널별로 세어 주문이 많은 채널부터 보여준다.

## 3. 두 번 이상 주문한 고객

```sql
SELECT
    "고객명",
    COUNT(DISTINCT "주문번호") AS "주문수"
FROM orders
WHERE "고객명" IS NOT NULL
  AND TRIM("고객명") <> ''
GROUP BY "고객명"
HAVING COUNT(DISTINCT "주문번호") >= 2
ORDER BY "주문수" DESC, "고객명";
```

**쉬운 설명:** 이름이 있는 고객의 고유 주문을 세어 두 번 이상 주문한 고객만 보여준다.
