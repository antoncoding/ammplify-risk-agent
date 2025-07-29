export function poolHourDataQuery(poolAddress: string, first: number = 168, skip: number = 0) {
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
      }
    }
  }`;
} 