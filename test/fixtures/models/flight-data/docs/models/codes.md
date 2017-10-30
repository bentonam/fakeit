# Codes Model

### Purpose

Serves as a lookup for IATA, ICAO and Ident codes for Airlines, Airports and Navaids.

### Example Document

```json
{
  "_id": "airport_code_KICT",
  "id": 3605,
  "doc_type": "code",
  "designation": "airport",
  "code_type": "icao",
  "code": "KICT"
}
```

### Model Definitions

```yaml
type: object
properties:
  _id:
    type: string
    description: The document id
  id:
    type: integer
    description: The id of the airline, airport, or navaid the code is for
  doc_type:
    type: string
    description: The document type
  designation:
    type: string
    description: The designation of the code, can be airline, airport, or navaid
  code_type:
    type: string
    description: The type of code, can be iata, icao, ident
  code:
    type: string
    description: The document type
```
