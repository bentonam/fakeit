# Navaids Model

### Example Document

```json
{
  "_id": "navaid_89137",
  "navaid_id": 89137,
  "doc_type": "navaid",
  "navaid_ident": "IC",
  "navaid_name": "Piche",
  "type": "NDB",
  "frequency_khz": 332,
  "geo": {
    "latitude": 37.57820129,
    "longitude": -97.4559021
  },
  "elevation": null,
  "iso_country": "US",
  "dme": {
    "frequency_khz": null,
    "channel": null,
    "latitude": null,
    "longitude": null,
    "elevation": null
  },
  "magnetic_variation": 5.011,
  "usage_type": "TERMINAL",
  "power": "MEDIUM",
  "associated_airport_icao_code": "KICT"
}
```

### Model Definitions

```yaml
type: object
properties:
  _id:
    type: string
    description: The document id
  navaid_id:
    type: integer
    description: The navaid id
  doc_type:
    type: string
    description: The document type
  navaid_ident:
    type: string
    description: The The navaid identifer code if available, otherwise null
  navaid_name:
    type: string
    description: The name of the navaid if available, otherwise null
  type:
    type: string
    description: The type of navaid if available, otherwise null
  frequency_khz:
    type: float
    description: The frequency in khz of the navaid if available, otherwise null
  geo:
    type: object
    properties:
      latitude:
        type: float
        description: The latitude of the navaid if available, otherwise null
      longitude:
        type: float
        description: The longitude of the navaid if available, otherwise null
  elevation:
    type: integer
    description: The elevation in ft of the navaid if available, otherwise null
  iso_country:
    type: string
    description: The ISO country code that the navaid is in
  dme:
    type: object
    properties:
      frequency_khz:
        type: float
        description: The frequency in khz an associated DME if available, otherwise null
      channel:
        type: string
        description: The DME channel if available, otherwise null
      latitude:
        type: float
        description: The DME latitude of the navaid if available, otherwise null
      longitude:
        type: float
        description: The DME longitude in khz of the navaid if available, otherwise null
      elevation:
        type: float
        description: The elevation of the DME in ft if available, otherwise null
  magnetic_variation:
    type: float
    description: The magnetic variation at the navaid's location if available, otherwise null
  usage_type:
    type: string
    description: The usage type of the navaid if available, otherwise null
  power:
    type: string
    description: The navaid's power if available, otherwise null
  associated_airport_icao_code:
    type: string
    description: An airport icao_code or ident that the navaid is associated with if available, otherwise null
```
