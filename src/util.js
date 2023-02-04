export function iconify(input = '') {
    const replacers = [
        {
            in: /\+/g,
            out: "plus"
        },
        {
            in: /\./g,
            out: "-dot-"
        },
        {
            in: /&/g,
            out: "-and-"
        },
        {
            in: ' ',
            out: ''
        },
        {
            in: '_',
            out: ''
        }
    ]
    // let output = input;
    let output = input.toLowerCase()
    replacers.forEach(replacer => {
        output = output.replace(replacer.in, replacer.out)
    })
    return output
}

export function getDescendantProp (obj, desc) {
    var arr = desc.split('/');
    while (arr.length && (obj = obj[arr.shift()]));
    return obj;
  }