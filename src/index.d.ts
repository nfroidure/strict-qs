type QSValue = any;
type QSParamValue = string | number | boolean;
type QSParamType = 'string' | 'number' | 'boolean';

type QSUniqueParameter = {
  name: string;
  pattern?: string;
  enum: QSParamValue[];
  type: QSParamType;
};

type QSArrayParameter = {
  name: string;
  type: 'array';
  ordered: boolean;
  items: {
    pattern?: string;
    enum: QSParamValue[];
    type: QSParamType;
  },
};

type QSParameter = QSUniqueParameter | QSArrayParameter;

declare function qsStrict(
  definitions: QSParameter[],
  search: string,
): {
  [name: string]: QSValue | QSValue[];
};

export default qsStrict;
