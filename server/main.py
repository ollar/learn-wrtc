import asyncio
import websockets
import logging
import json
# import uvloop

# PYTHONASYNCIODEBUG = True
# logging.basicConfig(level=logging.DEBUG)
logging.basicConfig(level=logging.INFO)


class WS_Handler:
    def __init__(self):
        self.connections = {}
        logging.info('server starts')

    async def __call__(self, websocket, path):
        # may set connections variables here
        if not self.connections.get(path):
            self.connections[path] = {}

        try:
            while True:
                message = await websocket.recv()

                try:
                    data = json.loads(message)
                except:
                    break

                logging.info('got message type: {}'.format(data['type']))

                self.connections[path][data.get('uid')] = websocket

                await self.dispatch_ws_types(data, path)

        except websockets.exceptions.ConnectionClosed:
            ws = self._getConnection(data.get('uid', ''), path)
            if ws and not ws.open:
                del self.connections[path][data['uid']]

            logging.info('closed 1001')

    def dispatch_ws_types(self, data, path):
        ws_types_handles_map = {
            'enterRoom': self._on_enter_room,
            'channelClose': self._on_channel_close,
            'offer': self._on_offer,
            'answer': self._on_answer,
            'iceCandidate': self._on_ice_candidate,
        }

        return ws_types_handles_map[data.get('type')](data, path)

    def _getConnection(self, uid, path):
        return self.connections[path].get(uid, None)

    async def sendData(self, uid, path, data):
        ws = self._getConnection(uid, path)

        if ws and ws.open:
            return await ws.send(json.dumps(data))

    async def _on_enter_room(self, data, path):
        for key in self.connections[path].keys():
            await self.sendData(key, path, {
                'type': 'newUser',
                'uid': data.get('uid'),
            })

    async def _on_offer(self, data, path):
        await self.sendData(data.get('toUid'), path, {
            'type': 'offerFrom',
            'fromUid': data.get('fromUid'),
            'offer': data.get('offer'),
        })

    async def _on_answer(self, data, path):
        await self.sendData(data.get('toUid'), path, {
            'type': 'answerFrom',
            'fromUid': data.get('fromUid'),
            'answer': data.get('answer'),
        })

    async def _on_ice_candidate(self, data, path):
        await self.sendData(data.get('toUid'), path, {
            'type': 'iceCandidateFrom',
            'fromUid': data.get('fromUid'),
            'iceCandidate': data.get('iceCandidate'),
        })

    async def _on_channel_close(self, data, path):
        for key in self.connections[path].keys():
            await self.sendData(key, path, {
                'type': 'channelClose',
                'uid': data['uid'],
            })
        if len(self.connections[path]) == 0:
            del self.connections[path]

loop = asyncio.get_event_loop()
# loop.set_debug(enabled=True)
ws_handler = WS_Handler()

ws_server = websockets.serve(ws_handler, host='localhost', port=8765, loop=loop)
future = asyncio.ensure_future(ws_server)

loop.run_forever()
