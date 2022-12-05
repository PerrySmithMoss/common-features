function parseSqlFile(sqlFile) {
  return sqlFile
    .toString()
    .replace(/(\r\n|\n|\r)/gm, " ") // remove newlines
    .replace(/\s+/g, " ") // excess white space
    .split(";"); // split into all statements
}

module.exports = {
  parseSqlFile,
};
