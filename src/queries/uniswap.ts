export function poolHourDataQuery(poolAddress: string, first = 168, skip = 0) {
  return `{
    poolHourDatas(
      where: { pool: \"${poolAddress.toLowerCase()}\" },
      orderBy: periodStartUnix,
      orderDirection: desc,
      first: ${first},
      skip: ${skip}
    ) {
      periodStartUnix
      token0Price
    }
  }`;
}

export function poolDataQuery(poolAddress: string) {
  return `{
    pool(id: \"${poolAddress.toLowerCase()}\") {
      id
      feeTier
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      poolDayData(first: 90, orderBy: date, orderDirection: desc) {
        volumeUSD
        volumeToken0
        volumeToken1
        date
        feesUSD
        high
        low
        open
        close
        feeGrowthGlobal0X128
        feeGrowthGlobal1X128
      }
    }
  }`;
}

export function poolsDataQuery(poolIds: string[]) {
  const poolIdsString = poolIds.map(id => `"${id.toLowerCase()}"`).join(', ');
  return `{
    pools(where: { id_in: [${poolIdsString}] }) {
      id
      feeTier
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      sqrtPrice
      liquidity
      poolHourData(first: 2, orderBy: periodStartUnix, orderDirection: desc) {
        volumeUSD
        volumeToken0
        volumeToken1
        feeGrowthGlobal0X128
        feeGrowthGlobal1X128
      }
      poolDayData(first: 2, orderBy: date, orderDirection: desc) {
        volumeUSD
        volumeToken0
        volumeToken1
        date
        feesUSD
        feeGrowthGlobal0X128
        feeGrowthGlobal1X128
      }
    }
  }`;
} 