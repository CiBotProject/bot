
exports.constants.FAILURE = 'failure'
exports.constants.SUCCESS = 'success'
exports.constants.message = {'status': '',  // Status, either FAILURE or SUCCESS as above
                             'message': '', // Message to send back user
                             'body': '',    // Body of message to next module, if necessary (i.e. issue body)
                             'blame': []}   // Users to blame for an issue if created