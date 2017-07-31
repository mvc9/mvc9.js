$x.onload(function() {
    $x.logLevel = 5;
    $x.console('log', "I'm colorful console log!", "#ff0099", 1);

    m.part2Data = 12345678;

    m.part3Data = (new Date()).toLocaleString();

    m.part4Data = function(n) {
        return n * 2;
    };

    m.part5Data = ['orange', 'banana', 'apple', 'strawberry'];
    c.fruitBtnClick = function(index) {
        m.part5Select = m.part5Data[index];
        $x.mapNode.compile('part5');
    }
}, true);
