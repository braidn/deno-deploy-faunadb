# Deno + Fauna Toy Focused GraphQL API

A rather simple (if not contrived) GraphQL API for creating and listing toys

## Getting Started

### Dependencies

* A [Deno](https://deno.land/) version > 1.10

### Executing program

* Utilize the included `schema.graphql` to create a new collection
* Create an index on this collection named 'all_toys'
* Start with the following:
    FAUNA_SECRET=$FAUNA_SECRET deployctl run --libs=ns,fetchevent --watch src/gql.ts

## Authors

* [@braidn](https://twitter.com/braidn)

## Version History

* 0.1
    * Initial Release

## License

This project is licensed under the UNLICENCE License - see the LICENSE.md file for details

## Acknowledgments

* [deno deploy](https://deno.com/deploy/docs/tutorial-faunadb)
