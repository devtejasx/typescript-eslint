//// @sourceType = module

import type * as T from 'foo';

export class Bar<T> implements T.Foo {
  someMethod(value: T): T.Baz {
    return value;
  }
}
