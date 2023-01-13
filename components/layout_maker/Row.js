export const Row = ({ children, row }) => {
  return <tr style={{ ...row.styles }}>{children}</tr>;
};
