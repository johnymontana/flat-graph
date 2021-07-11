# Flat Graph GitHub Action

Flat Graph is a GitHub action designed to be a companion to the [Flat Data GitHub action](https://octo.github.com/projects/flat-data) for regularly scraping data from a URL and enablles import into a Neo4j graph database using on Cypher.

## Why would I want to use this?

To periodically import data into Neo4j from a JSON file.

## Examples

Coming soon

## Usage

Create a GitHub Actions workflow yml file, `.github/workflows/flat.yml`. This example will use the Flat Data GitHub action to fetch the latest submissions to the Lobste.rs site every 60 minutes, then using the Flat Graph GitHub action import this data into Neo4j. Be sure to use GitHub secrets to avoid exposing credentials.

```yaml
name: Flat Graph for Neo4j

on:
  push:
    paths:
      - .github/workflows/flat.yml
  workflow_dispatch:
  schedule:
    - cron: '*/60 * * * *'

jobs:
  scheduled:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repo
        uses: actions/checkout@v2
      - name: Setup deno
        uses: denoland/setup-deno@main
        with:
          deno-version: v1.x
      - name: Fetch newest 
        uses: githubocto/flat@v2
        with:
          http_url: https://lobste.rs/newest.json
          downloaded_filename: newest.json
      - name: Neo4j import
        uses: johnymontana/flat-graph@v1.1
        with:
          neo4j-user: ${{secrets.NEO4J_USER}}
          neo4j-password: ${{secrets.NEO4J_PASSWORD}}
          neo4j-uri: ${{secrets.NEO4J_URI}}
          filename: 'newest.json'
          cypher-query: >
              UNWIND $value AS article
              MERGE (u:User {username: article.submitter_user.username})
              MERGE (a:Article {id: article.short_id})
              SET a.url           = article.url,
                  a.id_url        = article.short_id_url,
                  a.created_at    = article.created_at,
                  a.title         = article.title,
                  a.score         = article.score,
                  a.flags         = article.flags,
                  a.comment_count = article.comment_count,
                  a.description   = article.description,
                  a.comments_url  = article.comments_url
              MERGE (u)-[:SUBMITTED]->(a)
              WITH article, a
              UNWIND article.tags AS tag
              MERGE (t:Tag {name: tag})
              MERGE (a)-[:HAS_TAG]->(t)        
```

## Inputs


### `neo4j-user`

The username for your Neo4j instance

### `neo4j-password`

The password for your Neo4j user

### `neo4j-uri`

The connection string for your Neo4j instance

### `filename`

The name of the file to be loaded. Currently only JSON is supported. This file will be passed as a parameter to the specified Cypher query.

### `cypher-query`

The Cypher query to run. Your JSON file will be passed in a veriable `$value`

