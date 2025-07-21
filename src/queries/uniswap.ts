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