// Data object to pass to the next caller.
// If you expect this data to come from another function, add the field with a default below
var data = {'body': '',
            'blame': []
        }

exports.FAILURE = 'failure'
exports.SUCCESS = 'success'
exports.message = {'status': '',    // Status, either FAILURE or SUCCESS as above
                  'message': '',    // Message to send back user
                  'data': data     // Data to pass to the next caller
                }

exports.data = data;
