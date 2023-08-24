
const QLOG_RAW_OUTPUT_CONTAINER = "qlog_container";
document.getElementById(QLOG_RAW_OUTPUT_CONTAINER).innerHTML = "qlog-processor loaded, click the button";

function fetch_qlog() {
    // easiest is to add this to the page:
    // <button type="button" onclick="fetch_qlog()">Process qlog</button>
    // <div id="qlog_container">Don't press the button until I say so ;)</div>
    // <script src="assets/qlog-processor.js" defer></script>

    const qlog_container = document.getElementById(QLOG_RAW_OUTPUT_CONTAINER);
    qlog_container.innerHTML = "Fetching qlog... This can take a while";

    // this assumes the endpoint has a /qlog.json endpoint available that returns the current qlog for the connection
    // this is mainly true when using this setup in conjunction with https://github.com/http3-prioritization/aioquic
    fetch('/qlog.json')
        .then((response) => { 
            if ( !response.ok ) {
                throw new Error("Response not ok!" + JSON.stringify(response));
            }
            else {
                return response.json();
            }
        })
        .then((data) => {
            process_qlog(data, QLOG_RAW_OUTPUT_CONTAINER);
        })
        .catch(error => {
            console.error("qlog-processor:fetch_qlog: problem getting /qlog.json", error);
            qlog_container.innerHTML = "ERROR fetching qlog. Please check the JS console for details!";
        });
}

function process_qlog( qlog_json, qlog_container_id ){
    const qlog_container = document.getElementById(qlog_container_id);

    if ( !qlog_json || !qlog_json.traces || !qlog_json.traces.length ) {
        console.error("qlog-processor:process_qlog: malformed qlog?", qlog_json );
        qlog_container.innerHTML = "ERROR interpreting qlog. Please check the JS console for details!";
        return;
    }

    let streams = [];

    const events = qlog_json.traces[0].events;

    for (let evt of events) {
        if (evt.name == "http:frame_parsed") {
            const frame = evt.data.frame;
            const frame_type = frame.frame_type;

            if (frame_type == "headers") {
                const stream_id = evt.data.stream_id;

                let path = frame.headers.filter((header) => header.name == ":path");
                if (!path || path.length != 1) {
                console.error("No path found for headers frame... shouldn't happen!", frame);
                continue;
                }
                path = path[0].value;

                let stream = streams[stream_id]; // sparse array lookup, but shouldn't matter for this small amount of data
                if (stream === undefined) {
                streams[stream_id] = {
                    stream_id: stream_id,
                    time: evt.time,
                    path: path,
                    priorities: [],
                    priority: ""
                };
                stream = streams[stream_id];
                }

                stream.time = evt.time; // always want to have the request arrival time

                // not all streams will have a priority header set (set later through priority_update or just using the default u=3)
                const priority = frame.headers.filter((header) => header.name == "priority");
                if (priority && priority.length != 0) {
                if (priority.length != 1) {
                    // would mean the browser sends 2 headers
                    // or, in our case, doesn't override the browser header with the javascript-set header :) 
                    console.warn("Two priority headers... shouldn't happen!", priority, frame);


                    stream.priorities.push("HEADER1: " + priority[0].value);
                    stream.priority += " HEADER1: " + priority[0].value;


                    stream.priorities.push("HEADER2: " + priority[1].value);
                    stream.priority += " HEADER2: " + priority[1].value;

                    continue;
                }

                stream.priorities.push("HEADER: " + priority[0].value);
                stream.priority += " HEADER: " + priority[0].value;
                }

                // not all streams will have a path set (priority_update frame can arrive before the actual headers frame)
                if (stream.path === undefined) {
                stream.path = path;
                }
            } 
            else if (frame_type == "priority_update") {
                // console.log("UPDATE", frame.value );

                const stream_id = frame.element_id;
                const priority = frame.value;

                let stream = streams[stream_id];

                // if priority_update arrives before headers
                if (stream === undefined) {
                streams[stream_id] = {
                    stream_id: stream_id,
                    time: undefined,
                    path: undefined,
                    priorities: [],
                    priority: ""
                };
                stream = streams[stream_id];
                }

                stream.priorities.push("FRAME: " + priority);
                stream.priority += " FRAME: " + priority;
            }
        }
    }

    console.log("raw qlog streams output", streams);

    let qlog_output = `<textarea style="height: 50px;">` + JSON.stringify(qlog_json) + `</textarea>`;
    
    qlog_output += "<table>";
    
    // streams is a "sparse array" with undefined entries. 
    // Looping with "in" instead of "of" prevents us getting those
    for ( let streamNr in streams ) {

        const stream = streams[streamNr]; 
        qlog_output += "<tr>";

        qlog_output += "<td>" + stream.stream_id + "</td>";
        qlog_output += "<td>" + stream.path + "</td>";
        qlog_output += "<td>" + stream.priority + "</td>";

        qlog_output += "</tr>";
    }

    qlog_output += "</table>";

    qlog_container.innerHTML = qlog_output;
}