import { Express } from 'express';
import { EventEmitter } from 'events';

export const graphqlEventStream = ({
  streamPath = '/stream',
  emitter,
  app,
}: { app: Express, streamPath: string, emitter: EventEmitter }) => {
  app.use((req, res) => {
    res.setHeader('X-GraphQL-Event-Stream', streamPath);
    if (req.next) {
      req.next();
    }
  });

  app.get(streamPath, (req, res) => {
    if (req.headers.accept !== 'text/event-stream') {
      res.statusCode = 405;
      res.end();
      return;
    }

    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders(); // flush the headers to establish SSE with client
  
    console.log('connected to client.');
    let counter = 0;
    const updateClients = () => {
      counter++;
      console.log('sending update to client..');
      res.write(`data: ${JSON.stringify({num: counter})}\n\n`); // res.write() instead of res.send()
    };
    emitter.on('schema:updated', updateClients);
  
    // If client closes connection, stop sending events
    res.on('close', () => {
        console.log('client dropped me.');
        emitter.off('schema:updated', updateClients);
        res.end();
    });
  });
};
