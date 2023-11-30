export enum Access {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

const getValue = (value: string) => {
  if (value === 'PUBLIC') return Access.PUBLIC;
  if (value === 'PRIVATE') return Access.PRIVATE;
  return undefined;
};
