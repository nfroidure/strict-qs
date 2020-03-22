type QSOptions = {
  allowEmptySearch: boolean;
  allowUnknownParams: boolean;
  allowDefault: boolean;
  allowUnorderedParams: boolean;
};
type QSValue = string | number | boolean;
type QSParamValue = QSValue;
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
  };
};

type QSParameter = QSUniqueParameter | QSArrayParameter;

declare function qsStrict(
  options: QSOptions,
  definitions: QSParameter[],
  search: string,
): {
  [name: string]: QSValue | QSValue[];
};

export default qsStrict;
