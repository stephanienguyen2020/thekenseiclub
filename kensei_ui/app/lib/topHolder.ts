export async function fetchTopHolders(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/tools/pumpfun-top-holders/${token}`
    );
    const {data} = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching top holders:', error);
    return {error}
  }
}
