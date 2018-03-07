var colors = require('colors/safe');

function FailureReporter(silent, out) {
  this.out = out || process.stdout;
  this.silent = silent;
  this.total = 0;
  this.fail = 0;
  this.pass = 0;  // used by ci/index.js getExitCode
  this.skipped = 0;
}

FailureReporter.prototype = {
  report: function(prefix, data) {
    this.display(prefix, data);
    this.total++;
    if (data.skipped) {
      this.skipped++;
    } else if (data.passed) {
      this.pass++;
    } else {
      this.fail++;
    }
  },

  display: function(prefix, result) {
    var out = this.out;
    function print(msg) {
      out.write(msg + '\n');
    }

    var name = result.name.trim().replace(/^Exam Partition /, '');

    if (result.skipped) {
      return print(colors.yellow('* ') + name);
    }

    if (result.passed) {
      return print(colors.green('\u2713\uFE0F ') + name);
    }

    print(colors.red('F ' + name));

    if(result.error && result.error.message) {
      // result.error.message is the whole stack trace
      var lines = result.error.message.split('\n');
      var last = lines[lines.length-1].split(': ');
      // at http://localhost:7357/assets/test-support.js:5463: No model was found for 'user'
      // line number and file aren't useful because it's the concatenated file
      if (last.length > 1) {
        print(last[1]);
      } else {
        print(lines[lines.length-1]);
      }

      print(result.error.message.replace(/\n/g, '\n    '));
    }
  },

  finish: function() {
    if (this.silent) {
      return;
    }

    var summary = this.fail+'/'+this.total+' failed ';
    var thumbsup = '\uD83D\uDC4D';
    var thumbsdown = '\uD83D\uDC4E';

    this.out.write('\n');
    if (this.fail === 0) {
      this.out.write(colors.green(summary) + thumbsup + '\n');
    } else {
      this.out.write(colors.red(summary) + thumbsdown + '\n');
    }
  }
};

module.exports = FailureReporter;
