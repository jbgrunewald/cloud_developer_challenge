const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');
const server = require('./server');

const spaceFlightQuery = gql`
query spaceFlightQuery($mission_name: String!){
  spaceFlight(mission_name: $mission_name) {
    flight_number
    mission_name
    rocket {
      payloads {
        payload_id
        norad_id
      }
    }
   launch_site {
    site_name_long
    site_id
    site_name
  }
  }
}
`;

const spaceFlightsQuery = gql`
query spaceFlightsQuery($norad_id: Int, $minDate: Int, $maxDate: Int) {
  spaceFlights(norad_id: $norad_id, min_date: $minDate, max_date: $maxDate) {
    flight_number
    launch_date_unix
    mission_name
    rocket {
      payloads {
        payload_id
        norad_id
      }
    }
   launch_site {
    site_name_long
    site_id
    site_name
  }
  }
}
`;

describe('#queries', () => {
  let client;
  beforeAll(() => {
    const { query } = createTestClient(server);
    client = query;
  });

  describe('#spaceFlight', () => {
    it('should return a matching space flight when it exists', async () => {
      const res = await client({ query: spaceFlightQuery, variables: { mission_name: 'Starlink 4' } });
      expect(res).toMatchSnapshot();
    });

    it('should return null if no matching flight', async () => {
      const res = await client({ query: spaceFlightQuery, variables: { mission_name: 'Starlink 211' } });
      expect(res).toMatchSnapshot();
    });
  });

  describe('#spaceFlights', () => {
    it('should return space flights matching before end date', async () => {
      const res = await client({ query: spaceFlightsQuery, variables: { maxDate: 1581951955 } });
      expect(res).toMatchSnapshot();
    });

    it('should return space flights after start date', async () => {
      const res = await client({ query: spaceFlightsQuery, variables: { minDate: 1587583800 } });
      expect(res).toMatchSnapshot();
    });

    it('should return space flights between min and max date', async () => {
      const res = await client(
        { query: spaceFlightsQuery, variables: { minDate: 1583556631, maxDate: 1584533760 } },
      );
      expect(res).toMatchSnapshot();
    });

    it('should return space flights with matching norad_id', async () => {
      const res = await client({ query: spaceFlightsQuery, variables: { norad_id: 45178 } });
      expect(res).toMatchSnapshot();
    });

    it('should return empty array when there are no matches', async () => {
      const res = await client({ query: spaceFlightsQuery, variables: { norad_id: 200 } });
      expect(res).toMatchSnapshot();
    });

    it('should return all flights with no filters', async () => {
      const res = await client({ query: spaceFlightsQuery });
      expect(res).toMatchSnapshot();
    });
  });
});
