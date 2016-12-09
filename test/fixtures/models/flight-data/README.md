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
[flight-data]$ fakeit -m models -i input -d couchbase -b flight-data
Generating 6922 documents for Airports model
Generating 7 documents for Continents model
Generating 17137 documents for Frequencies model
Generating 10314 documents for Navaids model
Generating 3999 documents for Regions model
Generating 247 documents for Countries model
Generating 8813 documents for Runways model
Generating 67065 documents for Routes model
Generating 10000 documents for Users model
Generating 5911 documents for Airlines model
Generating 6922 documents for AirportFrequencies model
Generating 29555 documents for AirlineReviews model
Generating 6922 documents for AirportAirlines model
Generating 6922 documents for AirportNavaids model
Generating 34610 documents for AirportReviews model
Generating 6922 documents for AirportRunways model
Generating 30419 documents for Codes model
```

If you wanted to generated the models separately and add them to Couchbase use the following commands.  *Note some models may have to be generated more than once but can be excluded from output

#### Continents

```bash
[flight-data]$ fakeit -m models/continents.yaml -i input/continents.csv -d couchbase -s 127.0.0.1 -b flight-data
Generating 7 documents for Continents model
```

#### Countries

```bash
[flight-data]$ fakeit -m models/countries.yaml -i input/countries.csv -d couchbase -s 127.0.0.1 -b flight-data
Generating 247 documents for Countries model
```

#### Regions

```bash
[flight-data]$ fakeit -m models/regions.yaml -i input/regions.csv -d couchbase -s 127.0.0.1 -b flight-data
Generating 3999 documents for Regions model
```

#### Users

```bash
[flight-data]$ fakeit -m models/regions.yaml,models/users.yaml -i input/regions.csv -d couchbase -s 127.0.0.1 -b flight-data -e Regions
Generating 3999 documents for Regions model
Generating 10000 documents for Regions model
```

#### Airports

```bash
[flight-data]$ fakeit -m models/airports.yaml -i input/airports.csv -d couchbase -s 127.0.0.1 -b flight-data
Generating 6922 documents for Airports model
```

#### Frequencies

```bash
[flight-data]$ fakeit -m models/frequencies.yaml -i input/frequencies.csv -d couchbase -s 127.0.0.1 -b flight-data
Saving 17137 documents for Frequencies model
```

#### Navaids

```bash
[flight-data]$ fakeit -m models/navaids.yaml -i input/navaids.csv -d couchbase -s 127.0.0.1 -b flight-data
Generating 10314 documents for Navaids model
```

#### Routes

```bash
[flight-data]$ fakeit -m models/routes.yaml -i input/routes.csv -d couchbase -s 127.0.0.1 -b flight-data
Generating 67065 documents for Routes model
```

#### Runways

```bash
[flight-data]$ fakeit -m models/runways.yaml -i input/runways.csv -d couchbase -s 127.0.0.1 -b flight-data
Generating 10314 documents for Navaids model
```

#### Airlines

```bash
[flight-data]$ fakeit -m models/airlines.yaml,models/countries.yaml -i input/airlines.csv,input/countries.csv -d couchbase -s 127.0.0.1 -b flight-data -e Countries
Generating 5912 documents for Airlines model
```

#### Airline Reviews

```bash
[flight-data]$ fakeit -m models/airlines.yaml,models/countries.yaml,models/regions.yaml,models/users.yaml,models/airline_reviews.yaml -i input/airlines.csv,input/countries.csv,input/regions.csv -d couchbase -s 127.0.0.1 -b flight-data -e Countries,Regions,Users,Airlines
Generating 247 documents for Countries model
Generating 3999 documents for Regions model
Generating 5912 documents for Airlines model
Generating 10000 documents for Users model
Generating 29560 documents for AirlinesReviews model
```

#### Airport Airlines

```bash
[flight-data]$ fakeit -m models/airport_airlines.yaml,models/airports.yaml,models/routes.yaml,models/airlines.yaml,models/countries.yaml -i input/airlines.csv,input/airports.csv,input/routes.csv,input/countries.csv -d couchbase -s 127.0.0.1 -b flight-data -e Countries,Airports,Routes,Airlines
Saving 6922 documents for AirportAirlines model
```

#### Airport Frequencies

```bash
[flight-data]$ fakeit -m models/airport_frequencies.yaml,models/airports.yaml,models/frequencies.yaml -i input/airports.csv,input/frequencies.csv -d couchbase -s 127.0.0.1 -b flight-data -e Airports,Frequencies
Generating 6922 documents for AirportFrequencies model
```

#### Airport Navaids

```bash
[flight-data]$ fakeit -m models/airport_navaids.yaml,models/airports.yaml,models/navaids.yaml -i input/airports.csv,input/navaids.csv -d couchbase -s 127.0.0.1 -b flight-data -e Airports,Navaids
Generating 6922 documents for AirportNavaids model
```

#### Airport Reviews

```bash
[flight-data]$ fakeit -m models/airports.yaml,models/regions.yaml,models/users.yaml,models/airport_reviews.yaml -i input/airports.csv,input/regions.csv -d couchbase -s 127.0.0.1 -b flight-data -e Airports,Regions,Users
Generating 3999 documents for Regions model
Generating 6922 documents for Airports model
Generating 10000 documents for Users model
Generating 34610 documents for AirportReviews model
```

#### Airport Runways

```bash
[flight-data]$ fakeit -m models/airport_runways.yaml,models/airports.yaml,models/runways.yaml -i input/airports.csv,input/runways.csv -d couchbase -s 127.0.0.1 -b flight-data -e Airports,Runways
Generating 6922 documents for AirportRunways model
```

#### Codes

```bash
[flight-data]$ fakeit -m models/airports.yaml,models/airlines.yaml,models/countries.yaml,models/navaids.yaml,models/codes.yaml -i input/airports.csv,input/airlines.csv,input/countries.csv,input/navaids.csv -d couchbase -s 127.0.0.1 -b flight-data -e Airports,Airlines,Navaids,Countries
Generating 36944 documents for Codes model
```

If you want to generate each of the models as JSON files in separate ZIP archives use the following commands.

#### Continents

```bash
fakeit -m models/continents.yaml -i input/continents.csv -d output -a continents.zip -f 0
```

#### Countries

```bash
fakeit -m models/countries.yaml -i input/countries.csv -d output -a countries.zip -f 0
```

#### Regions

```bash
fakeit -m models/regions.yaml -i input/regions.csv -d output -a regions.zip -f 0
```

#### Airports

```bash
fakeit -m models/airports.yaml -i input/airports.csv -d output -a airports.zip -f 0
```

#### Frequencies

```bash
fakeit -m models/frequencies.yaml -i input/frequencies.csv -d output -a frequencies.zip -f 0
```

#### Navaids

```bash
fakeit -m models/navaids.yaml -i input/navaids.csv -d output -a navaids.zip -f 0
```

#### Routes

```bash
fakeit -m models/routes.yaml -i input/routes.csv -d output -a routes.zip -f 0
```

#### Runways

```bash
fakeit -m models/runways.yaml -i input/runways.csv -d output -a runways.zip -f 0
```

#### Airlines

```bash
fakeit -m models/airlines.yaml,models/countries.yaml -i input/airlines.csv,input/countries.csv -d output -a airlines.zip -f 0 -e Countries
```

#### Airline Reviews

```bash
[flight-data]$ fakeit -m models/airlines.yaml,models/countries.yaml,models/regions.yaml,models/users.yaml,models/airline_reviews.yaml -i input/airlines.csv,input/countries.csv,input/regions.csv -d output -a airline_reviews.zip -e Countries,Regions,Users -f 0
```

#### Airport Airlines

```bash
fakeit -m models/airport_airlines.yaml,models/airports.yaml,models/routes.yaml,models/airlines.yaml,models/countries.yaml -i input/airlines.csv,input/airports.csv,input/routes.csv,input/countries.csv -d output -a airport_airlines.zip -f 0 -e Countries,Airports,Routes,Airlines
```

#### Airport Frequencies

```bash
fakeit -m models/airport_frequencies.yaml,models/airports.yaml,models/frequencies.yaml -i input/airports.csv,input/frequencies.csv -d output -a airport_frequencies.zip -f 0 -e Airports,Frequencies
```

#### Airport Navaids

```bash
fakeit -m models/airport_navaids.yaml,models/airports.yaml,models/navaids.yaml -i input/airports.csv,input/navaids.csv -d output -a airport_navaids.zip -f 0 -e Airports,Navaids
```

#### Airport Reviews

```bash
[flight-data]$ fakeit -m models/airports.yaml,models/regions.yaml,models/users.yaml,models/airport_reviews.yaml -i input/airports.csv,input/regions.csv -d output -a airport_reviews.zip -e Airports,Regions,Users -f 0
```

#### Airport Runways

```bash
fakeit -m models/airport_runways.yaml,models/airports.yaml,models/runways.yaml -i input/airports.csv,input/runways.csv -d output -a airport_runways.zip -f 0 -e Airports,Runways
```

#### Codes

```bash
fakeit -m models/airports.yaml,models/airlines.yaml,models/countries.yaml,models/navaids.yaml,models/codes.yaml -i input/airports.csv,input/airlines.csv,input/countries.csv,input/navaids.csv -d output -a codes.zip -f 0 -e Airports,Airlines,Navaids,Countries
```
