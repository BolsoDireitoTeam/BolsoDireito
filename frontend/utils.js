function FormatDate(date) {
    return date.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

console.log(FormatDate(new Date()));
console.log(FormatDate(new Date("2024-01-01")));
