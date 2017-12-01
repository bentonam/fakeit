## Flight Data Example

The models in this example rely entirely on data made available to the models.  The data being passed to these models came from the following sources:

- [http://ourairports.com/data/](http://ourairports.com/data/) for Airports, Countries, Frequencies, Navaids, Regions, Runways
- [http://openflights.org/data.html](http://openflights.org/data.html) for Airports, Airlines, Routes

These data models demonstrate the following:

- How to use [Model Dependencies](https://github.com/bentonam/fakeit#model-dependencies) with [fakeit](https://github.com/bentonam/fakeit)
- Using the `globals` variable as a counter
- Using the `inputs` to make external data available to the model
- Using the `documents` variable to use data from a previously generated model

There are 17 types of models that will be generated

- [Airlines](docs/models/airlines.md)
- [Airlines Reviews](docs/models/airline_reviews.md)
- [Airports](docs/models/airports.md)
- [Airport Airlines](docs/models/airport_airlines.md)
- [Airport Frequencies](docs/models/airport_frequencies.md)
- [Airport Navaids](docs/models/airport_navaids.md)
- [Airport Reviews](docs/models/airport_reviews.md)
- [Airport Runways](docs/models/airport_runways.md)
- [Codes](docs/models/codes.md)
- [Continents](docs/models/continents.md)
- [Countries](docs/models/countries.md)
- [Frequencies](docs/models/frequencies.md)
- [Navaids](docs/models/navaids.md)
- [Regions](docs/models/regions.md)
- [Routes](docs/models/routes.md)
- [Runways](docs/models/runways.md)
- [Users](docs/models/users.md)

If you would like to see further examples of how to query this data set using the [N1QL](http://www.couchbase.com/n1ql) query language from [Couchbase](http://www.couchbase.com/) checkout the [Examples](docs/n1ql/).

### Terms

- [IATA](http://www.iata.org/about/members/Pages/airline-list.aspx?All=true): International Air Transport Association
- [ICAO](http://www.icao.int/): International Civil Aviation Organization
- [FAA](http://www.faa.gov/): Federal Aviation Administration
- Callsign: The term used to identify the broadcaster or transimitter over radio
- Navaid: Navigational Aid
- Ident: An entity identifier typically used for GPS codes
- [DME](https://en.wikipedia.org/wiki/Distance_measuring_equipment): Distance Measuring Equipment
- [Magnetic Variation](https://en.wikipedia.org/wiki/Magnetic_declination): Magnetic declination or variation is the angle on the horizontal plane between magnetic north and true north
- Magnetic Heading: The heading of the aircraft relative to magnetic north
- [Displayed Threshold](https://en.wikipedia.org/wiki/Displaced_threshold): A displaced threshold is a runway threshold located at a point other than the physical beginning or end of the runway.

### Usage Examples

> Warning executing this entire example will generate ~250,000 documents

Below is a variety of commands that can be used on this data model, all of the examples assume that you are in the `flight-data/` directory.  While all of the `fakeit` options will work, for this example we will only demonstrate how adding the data to Couchbase.  Please be aware that this may take several minutes to complete.

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/*
```

If you wanted to generated the models separately and add them to Couchbase use the following commands.  *Note some models may have to be generated more than once but are excluded from output

#### Continents

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/continents.yaml
```

#### Countries

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/countries.yaml
```

#### Regions

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/regions.yaml
```

#### Users

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/users.yaml
```

#### Airports

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/airports.yaml
```

#### Frequencies

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/frequencies.yaml
```

#### Navaids

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/navaids.yaml
```

#### Routes

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/routes.yaml
```

#### Runways

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/runways.yaml
```

#### Airlines

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/airlines.yaml
```

#### Airline Reviews

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/airline_reviews.yaml
```

#### Airport Airlines

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/airport_airlines.yaml
```

#### Airport Frequencies

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/airport_frequencies.yaml
```

#### Airport Navaids

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/airport_navaids.yaml
```

#### Airport Reviews

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/airport_reviews.yaml
```

#### Airport Runways

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/airport_runways.yaml
```

#### Codes

```bash
fakeit couchbase --server 127.0.0.1 --bucket flight-data models/codes.yaml
```

If you want to generate each of the models as JSON files in separate ZIP archives use the following commands.

#### Continents

```bash
fakeit directory --spacing 0 output/continents.zip models/continents.yaml
```

#### Countries

```bash
fakeit directory --spacing 0 output/continents.zip models/countries.yaml
```

#### Regions

```bash
fakeit directory --spacing 0 output/regions.zip models/regions.yaml
```

#### Airports

```bash
fakeit directory --spacing 0 output/airports.zip models/airports.yaml
```

#### Frequencies

```bash
fakeit directory --spacing 0 output/frequencies.zip models/frequencies.yaml
```

#### Navaids

```bash
fakeit directory --spacing 0 output/navaids.zip models/navaids.yaml
```

#### Routes

```bash
fakeit directory --spacing 0 output/routes.zip models/routes.yaml
```

#### Runways

```bash
fakeit directory --spacing 0 output/runways.zip models/runways.yaml
```

#### Airlines

```bash
fakeit directory --spacing 0 output/airlines.zip models/airlines.yaml
```

#### Airline Reviews

```bash
fakeit directory --spacing 0 output/airline_reviews.zip models/airline_reviews.yaml
```

#### Airport Airlines

```bash
fakeit directory --spacing 0 output/airport_airlines.zip models/airport_airlines.yaml
```

#### Airport Frequencies

```bash
fakeit directory --spacing 0 output/airport_frequencies.zip models/airport_frequencies.yaml
```

#### Airport Navaids

```bash
fakeit directory --spacing 0 output/airport_navaids.zip models/airport_navaids.yaml
```

#### Airport Reviews

```bash
fakeit directory --spacing 0 output/airport_reviews.zip models/airport_reviews.yaml
```

#### Airport Runways

```bash
fakeit directory --spacing 0 output/airport_runways.zip models/airport_runways.yaml
```

#### Codes

```bash
fakeit directory --spacing 0 output/codes.zip models/codes.yaml
```
