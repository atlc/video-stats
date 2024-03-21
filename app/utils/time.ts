function format(time: number) {
    let toSeconds = Math.round(time / 1000);
    let hours: number | string = Math.floor(toSeconds / 3600);
    let minutes: number | string = (toSeconds % 3600) / 60;
    let seconds: number | string = Math.round((minutes - Math.floor(minutes)) * 60);
    minutes = Math.floor(minutes);

    hours = hours < 10 ? `0${hours}` : `${hours}`;
    minutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    seconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${hours}:${minutes}:${seconds}`;
}

export default {
    milliseconds: {
        to: {
            HHMMSS: format,
        },
    },
};
