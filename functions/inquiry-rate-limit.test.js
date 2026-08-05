import assert from 'node:assert/strict';
import test from 'node:test';
import {
  inquiryLimitExceeded,
  inquirySubmissionAvailable
} from './inquiry-rate-limit.js';

const limits = {
  maximumPerIp: 5,
  maximumPerEmail: 3,
  maximumGlobal: 200
};

test('the global inquiry window bounds IP and email rotation', () => {
  assert.equal(inquiryLimitExceeded({
    ...limits,
    ipCount: 0,
    emailCount: 0,
    globalCount: 199
  }), false);
  assert.equal(inquiryLimitExceeded({
    ...limits,
    ipCount: 0,
    emailCount: 0,
    globalCount: 200
  }), true);
  assert.equal(inquiryLimitExceeded({
    ...limits,
    ipCount: 5,
    emailCount: 0,
    globalCount: 1
  }), true);
  assert.equal(inquiryLimitExceeded({
    ...limits,
    ipCount: 0,
    emailCount: 3,
    globalCount: 1
  }), true);
});

test('site availability disables transactional inquiry intake', () => {
  assert.equal(inquirySubmissionAvailable({ availability: 'unavailable' }), false);
  assert.equal(inquirySubmissionAvailable({ availability: 'open-to-inquiries' }), true);
  assert.equal(inquirySubmissionAvailable({ availability: 'limited' }), true);
  assert.equal(inquirySubmissionAvailable({ availability: 'selective' }), false);
  assert.equal(inquirySubmissionAvailable({}), false);
  assert.equal(inquirySubmissionAvailable(null), false);
});
