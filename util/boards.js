sensors = {
        'Linked-In': {
            board_desc: 'Linked In HQ',
            board_src: 'https://maps.google.com/maps?f=q&amp;source=s_q&amp;hl=en&amp;geocode=&amp;q=37.424086,+-122.070940&amp;aq=&amp;sll=37.423458,-122.071146&amp;sspn=0.004254,0.003819&amp;t=m&amp;ie=UTF8&amp;ll=37.423787,-122.071152&amp;spn=0.003408,0.004292&amp;z=16&amp;output=embed',
            board_link: 'https://maps.google.com/maps?f=q&amp;source=embed&amp;hl=en&amp;geocode=&amp;q=37.424086,+-122.070940&amp;aq=&amp;sll=37.423458,-122.071146&amp;sspn=0.004254,0.003819&amp;t=m&amp;ie=UTF8&amp;ll=37.423787,-122.071152&amp;spn=0.003408,0.004292&amp;z=16',
        },
        'Madagascar-Desert': {
            board_desc: 'Middle of Nowhere',
            board_src: 'https://maps.google.com/maps?f=q&amp;source=s_q&amp;hl=en&amp;geocode=&amp;q=-19.197053,46.153152&amp;aq=&amp;sll=37.413214,-122.081267&amp;sspn=0.192521,0.238266&amp;t=h&amp;ie=UTF8&amp;z=9&amp;output=embed',
            board_link: 'https://maps.google.com/maps?f=q&amp;source=embed&amp;hl=en&amp;geocode=&amp;q=-19.197053,46.153152&amp;aq=&amp;sll=37.413214,-122.081267&amp;sspn=0.192521,0.238266&amp;t=h&amp;ie=UTF8&amp;z=9',
        }
}

for (var boardKey in sensors) {
    sensors[boardKey].posts = [];
    sensors[boardKey].handler = null;
}

module.exports = sensors;
