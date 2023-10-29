const formatReplaceRegex = /YYYY|MM|DD|hh|mm|ss/g;

const DateFormatter = (fmt: string) => {
    return (date: Date) => {
        return fmt.replaceAll(formatReplaceRegex, (part: string) => {
            switch (part) {
                case "YYYY":
                    return String(date.getFullYear()).padStart(4, "0");
                case "MM":
                    return String(date.getMonth() + 1).padStart(2, "0");
                case "DD":
                    return String(date.getDate()).padStart(2, "0");
                case "hh":
                    return String(date.getHours()).padStart(2, "0");
                case "mm":
                    return String(date.getMinutes()).padStart(2, "0");
                case "ss":
                    return String(date.getSeconds()).padStart(2, "0");
                default:
                    return part;
            }
        });
    };
};

const DateParser = (fmt: string) => {
    let parts: string[] = [];
    const parseRegex = new RegExp("^" + fmt.replaceAll(formatReplaceRegex, (part: string) => {
        switch (part) {
            case "YYYY":
                parts.push(part);
                return "(\\d{4})";
            case "MM":
                parts.push(part);
                return "(\\d{2})";
            case "DD":
                parts.push(part);
                return "(\\d{2})";
            case "hh":
                parts.push(part);
                return "(\\d{2})";
            case "mm":
                parts.push(part);
                return "(\\d{2})";
            case "ss":
                parts.push(part);
                return "(\\d{2})";
            default:
                return part;
        }
    }) + "$");
    return (raw: string) => {
        const match = raw.match(parseRegex);
        if (!match || match.length !== parts.length + 1) {
            return undefined;
        }
        let year = 0, month = 0, date = 1, hours = 0, minutes = 0, seconds = 0;
        for (let i = 1; i < match.length; i++) {
            console.log(parts[i - 1], match[i]);
            switch (parts[i - 1]) {
                case "YYYY":
                    year = Number(match[i]);
                    break;
                case "MM":
                    month = Number(match[i]) - 1;
                    break;
                case "DD":
                    date = Number(match[i]);
                    break;
                case "hh":
                    hours = Number(match[i]);
                    break;
                case "mm":
                    minutes = Number(match[i]);
                    break;
                case "ss":
                    seconds = Number(match[i]);
                    break;
            }
        }
        return new Date(year, month, date, hours, minutes, seconds);
    };
};

export { DateFormatter, DateParser };
