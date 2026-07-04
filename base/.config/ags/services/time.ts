import { createPoll } from 'ags/time';

export const clockTime = createPoll('', 1000, "date '+%H:%M'");
export const clockTz = createPoll('', 60000, "date '+%Z'");
export const clockDate = createPoll('', 60000, "date '+%B %d, %Y'");
export const clockDay = createPoll('', 60000, "env LC_TIME=en_US.UTF-8 date '+%A'");
export const shortDate = createPoll('', 60000, "date '+%m/%d'");
export const shortDay = createPoll('', 60000, "env LC_TIME=en_US.UTF-8 date '+%a'");
