import { describe, expect, it } from 'vitest';
import { canWriteToList } from './todoAccess';

describe('canWriteToList', () => {
  it('returns false when list is missing', () => {
    expect(canWriteToList(null, { id: '1', username: 'alice' })).toBe(false);
  });

  it('returns false when user is missing', () => {
    expect(canWriteToList({ id: '1', name: 'list', members: [] }, null)).toBe(false);
  });

  it('returns true for a write member', () => {
    expect(
      canWriteToList(
        {
          id: '1',
          name: 'list',
          members: [{ id: '1', username: 'alice' }],
          readOnlyMembers: [{ id: '2', username: 'bob' }],
        },
        { id: '1', username: 'alice' },
      ),
    ).toBe(true);
  });

  it('returns false for read-only members', () => {
    expect(
      canWriteToList(
        {
          id: '1',
          name: 'list',
          members: [{ id: '1', username: 'alice' }],
          readOnlyMembers: [{ id: '2', username: 'bob' }],
        },
        { id: '2', username: 'bob' },
      ),
    ).toBe(false);
  });
});
