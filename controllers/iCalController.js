import ical, {ICalCalendarMethod} from 'ical-generator';

const calendar = ical({name: 'my first iCal'});

// A method is required for outlook to display event as an invitation
calendar.method(ICalCalendarMethod.REQUEST);

const startTime = new Date();
const endTime = new Date();
endTime.setHours(startTime.getHours()+1);
calendar.createEvent({
    start: startTime,
    end: endTime,
    summary: 'Example Event',
    description: 'It works ;)',
    location: 'my room',
    url: 'http://sebbo.net/'
});