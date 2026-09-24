import { useEffect, useMemo } from "react";

/** <img> for a local File that cleans up its object URL. */
const FilePreview = ({ file, style, alt = "preview" }) => {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return <img alt={alt} src={url} style={style} />;
};

export default FilePreview;
