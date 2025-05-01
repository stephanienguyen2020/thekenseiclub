# OHLCV API Documentation

The OHLCV API provides candlestick chart data (Open, High, Low, Close, Volume) for token price history.

## Endpoints

### Get OHLCV Data

Retrieves time-series OHLCV data for a specific bonding curve over a specified time period.

```
GET /ohlcv
```

#### Query Parameters

| Parameter        | Type   | Required | Description                                         |
| ---------------- | ------ | -------- | --------------------------------------------------- |
| bonding_curve_id | string | Yes      | The ID of the bonding curve to fetch data for       |
| from             | string | Yes      | Start timestamp (e.g., '2025-05-01 00:00:00')       |
| to               | string | Yes      | End timestamp (e.g., '2025-05-01 23:59:59')         |
| resolution       | string | No       | Time bucket for aggregation (default: '15 minutes') |

#### Success Response

The API returns a 200 OK status code with an array of OHLCV data points:

```json
[
  {
    "time": "2025-05-01T12:45:00.000Z",
    "bonding_curve_id": "0x1234...",
    "high": "0.0025",
    "open": "0.002",
    "close": "0.0023",
    "low": "0.0019"
  },
  {
    "time": "2025-05-01T12:30:00.000Z",
    "bonding_curve_id": "0x1234...",
    "high": "0.0022",
    "open": "0.0018",
    "close": "0.002",
    "low": "0.0018"
  }
  // Additional data points...
]
```

#### Error Responses

##### 400 Bad Request

Missing required parameters:

```json
{
  "error": "Missing required parameter: bonding_curve_id"
}
```

Or:

```json
{
  "error": "Missing required parameter: from"
}
```

Or:

```json
{
  "error": "Missing required parameter: to"
}
```

##### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "details": "Error message details"
}
```

## Example Request

```bash
curl -X GET "http://localhost:3000/ohlcv?bonding_curve_id=0x1234...&from=2025-05-01%2000:00:00&to=2025-05-01%2023:59:59&resolution=15%20minutes"
```

## Notes

- The API uses TimescaleDB for efficient time-series data storage and querying
- The resolution parameter supports PostgreSQL time bucket formats (e.g., '5 minutes', '1 hour', '1 day')
- Data is ordered by time in descending order (newest first)
- The response does not include volume data as it's not currently tracked in the implementation
- The time buckets are aligned to standard intervals (e.g., 00:00, 00:15, 00:30, 00:45 for 15-minute intervals)
