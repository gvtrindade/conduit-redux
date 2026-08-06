export type OrderableEstimate = {
  id: string;
  missionItemId: string;
  aisleId: string | null;
  title: string;
};

export type OrderableMerchantAisle = {
  id: string;
  order: number;
  aisleId: string;
};

export type OrderableAisleRule = {
  missionItemId: string;
  merchantAisleId: string;
  order: number;
};

export function orderEstimatesByAisles(
  estimates: OrderableEstimate[],
  merchantAisles: OrderableMerchantAisle[],
  aisleRules: OrderableAisleRule[],
): OrderableEstimate[] {
  const orderByMerchantAisleId = new Map(
    merchantAisles.map((aisle) => [aisle.id, aisle.order]),
  );
  const orderByAisleId = new Map(
    merchantAisles.map((aisle) => [aisle.aisleId, aisle.order]),
  );

  const ruleAisleByItem = new Map<string, string>();
  aisleRules
    .slice()
    .sort((a, b) => a.order - b.order)
    .forEach((rule) => {
      if (!ruleAisleByItem.has(rule.missionItemId)) {
        ruleAisleByItem.set(rule.missionItemId, rule.merchantAisleId);
      }
    });

  const ranked = estimates.map((estimate) => {
    const ruleAisleId = ruleAisleByItem.get(estimate.missionItemId);
    let order: number | null = null;

    if (ruleAisleId) {
      order = orderByMerchantAisleId.get(ruleAisleId) ?? null;
    } else if (estimate.aisleId) {
      order = orderByAisleId.get(estimate.aisleId) ?? null;
    }

    return { estimate, order };
  });

  ranked.sort(({ order: a, estimate: estimateA }, { order: b, estimate: estimateB }) => {
    if (a === null && b === null) return estimateA.title.localeCompare(estimateB.title);
    if (a === null) return 1;
    if (b === null) return -1;
    if (a !== b) return a - b;
    return estimateA.title.localeCompare(estimateB.title);
  });

  return ranked.map(({ estimate }) => estimate);
}