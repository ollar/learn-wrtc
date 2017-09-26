import PeerModel from '../models/peer';

const PeersCollection = Backbone.Collection.extend({
  model: PeerModel,
});

export default PeersCollection;