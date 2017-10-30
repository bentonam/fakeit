# Runways Model

### Example Document

```json
{
  "_id": "runway_240444",
  "runway_id": 240444,
  "doc_type": "runway",
  "airport_id": 3605,
  "airport_ident": "KICT",
  "runway_length": 10301,
  "runway_width": 150,
  "surface": "CON",
  "lighted": true,
  "closed": false,
  "low_bearing": {
    "ident": "01L",
    "latitude": 37.635,
    "longitude": -97.446,
    "elevation": 1313,
    "magnetic_heading": 20,
    "displaced_threshold": null
  },
  "high_bearing": {
    "ident": "19R",
    "latitude": 37.6616,
    "longitude": -97.4338,
    "elevation": 1330,
    "magnetic_heading": 200,
    "displaced_threshold": null
  }
}
```

### Model Definitions

```yaml
type: object
properties:
  _id:
    type: string
    description: The document id
  runway_id:
    type: integer
    description: The runway id
  doc_type:
    type: string
    description: The document type
  airport_id:
    type: integer
    description: The id of the airport the runway belongs to
  airport_ident:
    type: string
    description: The airport identifier
  runway_length:
    type: integer
    description: The length of the runway in feet
  runway_width:
    type: integer
    description: The width of the runway in ft
  surface:
    type: string
    description: The runway surface
  lighted:
    type: boolean
    description: Whether or not the runway is lighted
  closed:
    type: boolean
    description: Whether or not the runway is closed
  low_bearing:
    type: object
    properties:
      ident:
        type: string
        description: The low bearing runway identifer (1 - 18)
      latitude:
        type: float
        description: The low bearing runway latitude
      longitude:
        type: float
        description: The low bearing runway longitude
      elevation:
        type: integer
        description: The low bearing runway elevation
      magnetic_heading:
        type: integer
        description: The low bearing true magnetic heading
      displaced_threshold:
        type: integer
        description: The low bearing displacement from the end of the runway to the threshold
  high_bearing:
    type: object
    properties:
      ident:
        type: string
        description: The high bearing runway identifer (19 - 36)
      latitude:
        type: float
        description: The high bearing runway latitude
      longitude:
        type: float
        description: The high bearing runway longitude
      elevation:
        type: integer
        description: The high bearing runway elevation
      magnetic_heading:
        type: integer
        description: The high bearing true magnetic heading
      displaced_threshold:
        type: integer
        description: The high bearing displacement from the end of the runway to the threshold
```
