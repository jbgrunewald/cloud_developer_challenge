/* eslint-disable camelcase,no-console */
const { ApolloServer, gql } = require('apollo-server');
const flightData = require('./space_flight_data');

// This is the definition of the GraphQL schema
// How you structure this schema to fit the spacex_launches_data below
// along with how you write the code is the primary assessment
const typeDefs = gql`
  type PayLoad {
    payload_id: String
    norad_id: [Int]
  }

  type Rocket {
    rocket_id: String
    payloads: [PayLoad]
  }
  
  type LaunchSite {
    site_id: String!
    site_name: String!
    site_name_long: String
  } 
  
  type SpaceFlight {
    flight_number: Int!
    mission_name: String!
    launch_date_unix: Int!
    rocket: Rocket
    launch_site: LaunchSite
    launch_success: Boolean!
  }

  type Query {
    spaceFlight(mission_name: String!): SpaceFlight
    spaceFlights(max_date: Int, min_date: Int, norad_id: Int): [SpaceFlight]
  }`;

// Resolvers define the technique for fetching the types defined in the schema.
const resolvers = {
  Query: {
    spaceFlight: (obj, args) => {
      console.log(`[spaceFlight] request received with args ${JSON.stringify(args)}`);
      const { mission_name } = args;
      // eslint-disable-next-line max-len
      const [result] = flightData.filter((flight) => flight.mission_name === mission_name);
      console.log(`[spaceFlight] found ${result ? 'matching result' : 'no matching results'} for args ${JSON.stringify(args)}`);
      return result;
    },
    spaceFlights: (obj, args) => {
      console.log(`[spaceFlights] request received with args ${JSON.stringify(args)}`);
      const { min_date = -Infinity, max_date = Infinity, norad_id } = args;
      let result = flightData;

      if (min_date || max_date) {
        result = result.filter((flight) => flight.launch_date_unix <= max_date && flight.launch_date_unix >= min_date);
      }

      if (norad_id) {
        result = result.filter((flight) => {
          const { rocket: { payloads } } = flight;
          return payloads.some((payload) => {
            const { norad_id: idList } = payload;
            return idList.includes(norad_id);
          });
        });
      }
      console.log(`[spaceFlights] found ${result.length} results for args ${JSON.stringify(args)}`);

      return result;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

module.exports = server;
