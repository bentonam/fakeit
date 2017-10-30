# Airports Model

### Example Document

```json
{
  "_id": "airport_3605",
  "airport_id": 3605,
  "doc_type": "airport",
  "airport_ident": "KICT",
  "airport_type": "large_airport",
  "airport_name": "Wichita Dwight D. Eisenhower National Airport",
  "geo": {
    "latitude": 37.64989853,
    "longitude": -97.43309784
  },
  "elevation": 1333,
  "iso_continent": "NA",
  "iso_country": "US",
  "iso_region": "US-KS",
  "municipality": "Wichita",
  "airport_icao": "KICT",
  "airport_iata": "ICT",
  "airport_gps_code": "KICT",
  "airport_local_code": "ICT",
  "timezone_offset": -6,
  "dst": "A",
  "timezone": "America/Chicago"
}
```

### Model Definitions

```yaml
type: object
properties:
  _id:
    type: string
    description: The document id
  airport_id:
    type: integer
    description: The airports id
  doc_type:
    type: string
    description: The document type
  airport_ident:
    type: string
    description: The airport identifier if available, otherwise null
  airport_type:
    type: string
    description: The airport type if available, otherwise null
  airport_name:
    type: string
    description: The airport name if available, otherwise null
  geo:
    type: object
    properties:
      latitude:
        type: float
        description: The airports latitude if available, otherwise null
      longitude:
        type: float
        description: The airport longitude if available, otherwise null
  elevation:
    type: integer
    description: The airport elevation in ft if available, otherwise null
  iso_continent:
    type: string
    description: The ISO continent code for the airport
  iso_country:
    type: string
    description: The ISO country code for the airport
  iso_region:
    type: string
    description: The ISO region code the airport is in if available, otherwise null
  municipality:
    type: string
    description: The airport city if available, otherwise null
  airport_icao:
    type: string
    description: The airport 4 character icao code if available, otherwise null
  airport_iata:
    type: string
    description: The airport 3 letter iata / faa code if available, otherwise null
  airport_gps_code:
    type: string
    description: The airports gps_code if available, otherwise null
  airport_local_code:
    type: string
    description: The airports local code if available, otherwise null
  timezone_offset:
    type: integer
    description: The airports timezone offset if available, otherwise null
  dst:
    type: string
    description: The airports daylight savings type if available, otherwise null
  timezone:
    type: string
    description: The airports timezone if available, otherwise null
```
