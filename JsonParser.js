const discriminiateParse = (jsonData) =>{
    const parsedData = (typeof(jsonData) == 'string' || jsonData instanceof String) ? JSON.parse(jsonData) : jsonData;

    return parsedData;
} 

module.exports = discriminiateParse;