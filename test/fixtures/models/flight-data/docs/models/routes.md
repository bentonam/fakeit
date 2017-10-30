# Routes Model

### Example Document

```json
{
   "_id": "route_00004f3c-db5c-56b3-b512-b3069949fd1c",
  "active": true,
  "airline_code": "TK",
  "codehsare": false,
  "destination_airport_code": "MQM",
  "doc_type": "route",
  "equipment": "320",
  "route_id": "00004f3c-db5c-56b3-b512-b3069949fd1c",
  "source_airport_code": "IST",
  "stops": 0
}
```

### Model Definitions

```yaml
type: object
properties:
  _id:
    type: string
    description: The document id
  route_id:
    type: string
    description: The route id
  doc_type:
    type: string
    description: The document type
  airline_code:
    type: string
    description: The airlines iata / icao code of the source airport
  source_airport_code:
    type: string
    description: The source airports iata / icao code
  destination_airport_code:
    type: string
    description: The destination airports iata / icao code
  codehsare:
    type: boolean
    description: Whether or not the route is a codeshare, meaning it is operated by another airline
  stops:
    type: integer
    description: The number of stops on the route
  equipment:
    type: string
    description: The equipment used for the route if available, otherwise null
  active:
    type: boolean
    description: Whether or not the route is active
```
