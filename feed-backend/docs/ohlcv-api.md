# OHLCV API Documentation

The OHLCV (Open, High, Low, Close, Volume) API provides time-series price data for bonding curves on the Sui blockchain. This data can be used for charting, analysis, and trading strategies.

## Endpoint

```
GET /ohlcv
```

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| bonding_curve_id | string | Yes | The ID of the bonding curve to retrieve data for |
| from | string | Yes | Start timestamp (ISO format or compatible with PostgreSQL timestamp) |
| to | string | Yes | End timestamp (ISO format or compatible with PostgreSQL timestamp) |
| resolution | string | No | Time bucket size (default: '15 minutes'). Examples: '1 minute', '1 hour', '1 day' |

## Response

The API returns an array of OHLCV data points, with each point containing:

```json
[
  {
    "time": "2023-06-01T12:00:00.000Z",
    "bondingCurveId": "0x1234...",
    "high": "1.25",
    "open": "1.20",
    "close": "1.22",
    "low": "1.18"
  },
  ...
]
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| time | string | Timestamp for the data point (ISO format) |
| bondingCurveId | string | ID of the bonding curve |
| high | string | Highest price during the time interval |
| open | string | Opening price at the start of the time interval |
| close | string | Closing price at the end of the time interval |
| low | string | Lowest price during the time interval |

## Example Request

```bash
curl -X GET "http://localhost:3000/ohlcv?bonding_curve_id=0x1234...&from=2023-06-01T00:00:00Z&to=2023-06-02T00:00:00Z&resolution=1%20hour"
```

## Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Missing required parameters |
| 500 | Internal Server Error - Database query failed |

### Error Response Format

```json
{
  "error": "Error message"
}
```

## Notes

- The API uses TimescaleDB's time_bucket function to aggregate data into time intervals
- Timestamps should be in a format compatible with PostgreSQL timestamp conversion
- The resolution parameter accepts PostgreSQL interval syntax