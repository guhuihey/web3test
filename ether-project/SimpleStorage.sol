//SPDX-Licesen-Identifier:MIT

pragma solidity ^0.8.8; //'^'可以使得高版本兼容该版本的代码 '>/</='大于小于等于可以用于确定版本范围

//contract 类似class

contract SimpleStorage {
    uint256 favoriteNumber;

    struct People {
        uint favoriteNumber;
        string name;
    }

    mapping(string => uint256) public nametofavoriteNumber;

    //People public person=People({favoriteNumber:2,name:"diaomao"});

    // uint[] public favoriteNumber 方括号中的数字代表数组上界，为定义上界代表随输入变动

    People[] public people;

    function store(uint256 _favoriteNumber) public virtual {
        favoriteNumber = _favoriteNumber;
    }

    function retreive() public view returns (uint256) {
        return favoriteNumber;
    }

    function Addperson(string memory _name, uint _favoriteNumber) public {
        // people.push(People{_favoriteNumber,_name});

        People memory newperson = People({
            favoriteNumber: _favoriteNumber,
            name: _name
        });

        people.push(newperson);
        nametofavoriteNumber[_name] = _favoriteNumber;
    }
}
