import asyncio
import websockets
import logging
import json
# import uvloop

logging.basicConfig(level=logging.INFO)
# logging.basicConfig(level=logging.DEBUG)


class WS_Handler:
    def __init__(self):
        self.connections = {}
        logging.info('server starts')

    async def __call__(self, websocket, path):
        # may set connections variables here

        try:
            while True:
                message = await websocket.recv()

                try:
                    data = json.loads(message)
                except:
                    break

                logging.info('got message type: {}'.format(data['type']))

                await self.dispatch_ws_types(data)(data, websocket)

        except websockets.exceptions.ConnectionClosed:
            ws = self._getConnection(data.get('uid', ''))
            if ws and not ws.open:
                del self.connections[data['uid']]

            logging.info('closed 1001')

    def dispatch_ws_types(self, data):
        ws_types_handles_map = {
            'enterRoom': self._on_enter_room,
            'channelClose': self._on_channel_close,
            'offer': self._on_offer,
            'answer': self._on_answer,
            'iceCandidate': self._on_ice_candidate,
        }

        return ws_types_handles_map[data.get('type')]

    def _getConnection(self, uid):
        return self.connections.get(uid, None)

    async def sendData(self, uid, data):
        ws = self._getConnection(uid)

        if ws and ws.open:
            return await ws.send(json.dumps(data))

    async def _on_enter_room(self, data, websocket):
        for key in self.connections.keys():
            await self.sendData(key, {
                'type': 'newUser',
                'uid': data.get('uid'),
            })

        self.connections[data.get('uid')] = websocket

    async def _on_offer(self, data, *args):
        await self.sendData(data.get('toUid'), {
            'type': 'offerFrom',
            'fromUid': data.get('fromUid'),
            'offer': data.get('offer'),
        })

    async def _on_answer(self, data, *args):
        await self.sendData(data.get('toUid'), {
            'type': 'answerFrom',
            'fromUid': data.get('fromUid'),
            'answer': data.get('answer'),
        })

    async def _on_ice_candidate(self, data, *args):
        await self.sendData(data.get('toUid'), {
            'type': 'iceCandidateFrom',
            'fromUid': data.get('fromUid'),
            'iceCandidate': data.get('iceCandidate'),
        })

    async def _on_channel_close(self, data, *args):
        for key in self.connections.keys():
            await self.sendData(key, {
                'type': 'channelClose',
                'uid': data['uid'],
            })
        if len(self.connections) == 0:
            del self.connections



loop = asyncio.get_event_loop()
# loop.set_debug(enabled=True)
ws_handler = WS_Handler()

ws_server = websockets.serve(ws_handler, host='0.0.0.0', port=8765, loop=loop)
future = asyncio.ensure_future(ws_server)

loop.run_forever()
