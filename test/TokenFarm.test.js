const DaiToken = artifacts.require('DaiToken');
const DappToken = artifacts.require('DappToken');
const TokenFarm = artifacts.require('TokenFarm');

// using Chai and Mocha for testing
require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('TokenFarm', (accounts) => {
  let daiToken;
  before(async () => {
    daiToken = await DaiToken.new();
  })

  // write tests here
  describe('Mock Dai deployment', async () => {
    it('has a name', async () => {
      const name = await daiToken.name();
      assert.equal(name, 'Mock DAI Token');
    });
  });
});