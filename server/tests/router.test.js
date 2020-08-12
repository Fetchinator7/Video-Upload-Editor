const app = require('../server');
const request = require('supertest')(app);

const videoPath = '/path/route';
const title = 'Title';
const description = 'Description';
const userName = 'Name';
const exportSeparateAudio = true;
const trimStart = '6';
const trimEnd = '7';

describe('POST to /video', () => {
  it('Responds with output.', async (done) => {
    const res = await request
      .post('/video')
      .send({
        videoPath: videoPath,
        title: title,
        description: description,
        userName: userName,
        exportSeparateAudio: exportSeparateAudio,
        trimStart: trimStart,
        trimEnd: trimEnd
      })
      .expect(500);
    // expect(res.body.account_id).toEqual({
    //   output: expect.any(String),
    //   path: videoPath,
    //   bodyObj: {
    //     videoPath: expect.any(String),
    //     title: title,
    //     description: description
    //   }
    // });
    done();
  });
});
