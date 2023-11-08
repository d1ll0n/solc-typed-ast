pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;
pragma experimental SMTChecker;

enum GlobalEnum {
    A,
    B,
    C
}

struct GlobalStruct {
    int a;
    uint[] b;
    mapping(address => uint) c;
    mapping(GlobalEnum => address) e;
    mapping(Empty => bool) d;
}

/// Sample library
/// Contains testSignedBaseExponentiation()
library SampleLibrary {
    function testSignedBaseExponentiation(int base, uint pow) public returns (int) {
        return (base ** pow);
    }
}

/// Sample interface
/// Contains infFunc() that returns `bytes memory`
interface SampleInterface {
    function infFunc(string calldata x) external returns (bytes memory);
}

abstract contract SampleAbstract {
    int internal some;

    /// An abtract overridable modifier
    modifier abstractMod(int a) virtual;

    constructor(int v) public {
        some = v;
    }

    function abstractFunc(address a) virtual internal returns (address payable);
}

/// Empty contract
/// Just a stub
contract Empty {}

contract EmptyPayable {
    constructor() public payable {}
}

contract SampleBase is SampleAbstract(1) {
    /// Alert event for particular address
    event Alert(address entity, string message);

    uint internal constant constVar = 0;
    uint internal immutable immutableVar1 = 1;
    uint public immutable immutableVar2;
    uint[] internal data;

    /// An implementation of the abstract modifier
    modifier abstractMod(int a) override {
        _;
        some += a;
    }

    /// Modifier that requires `some` to be positive
    /// before the function execution.
    modifier onlyPositiveSomeBefore() {
        require(some > 0, "Failure");
        _;
    }

    modifier alertingAfter(string memory message) {
        _;
        emit Alert(address(this), message);
    }

    constructor(uint v) public {
        immutableVar2 = v;
    }

    function abstractFunc(address a) override internal returns (address payable) {
        return payable(a);
    }

    function internalCallback() internal pure {}

    function testMinMax() public {
        assert(type(uint).min == 0);
        assert(type(uint).max == 115792089237316195423570985008687907853269984665640564039457584007913129639935);
        assert(type(int256).min == (-57896044618658097711785492504343953926634992332820282019728792003956564819968));
        assert(type(int256).max == 57896044618658097711785492504343953926634992332820282019728792003956564819967);
    }

    /// Interface ID (ERC-165)
    function testInterfaceId() public pure returns (bytes4) {
        return type(SampleInterface).interfaceId;
    }

    /// @dev tests calldata slicing
    function testSlices() public pure {
        (uint a, uint b) = abi.decode(msg.data[0:4], (uint, uint));
        (uint c, uint d) = abi.decode(msg.data[:4], (uint, uint));
        (uint e, uint f) = abi.decode(msg.data[4:], (uint, uint));
        (uint g, uint h) = abi.decode(msg.data[:], (uint, uint));
        (uint i, uint j) = abi.decode(msg.data, (uint, uint));
    }

    function testTryCatch() public alertingAfter("Other contract creation") {
        try new Empty() {
            int a = 1;
        } catch {
            int b = 2;
        }
        try new EmptyPayable{salt: 0x0, value: 1 ether}() returns (EmptyPayable x) {
            int a = 1;
        } catch Error(string memory reason) {} catch (bytes memory lowLevelData) {}
    }

    function testGWei() public {
        assert(1 gwei == 1000000000 wei);
        assert(1 gwei == 0.001 szabo);
    }

    function basicFunctionality() internal onlyPositiveSomeBefore() returns (uint) {
        function(address) internal returns (address payable) converter = SampleBase.abstractFunc;
        function() internal pure sel = SampleBase.internalCallback;
        uint[] memory nums = new uint[](3);
        nums[0] = 1;
        nums[1] = 2;
        nums[2] = 3;
        GlobalStruct memory a = GlobalStruct(1, nums);
        uint[] memory x = a.b;
        delete a;
        uint y = x[1];
        delete x;
        return y;
    }

    function testSelectors() public {
        this.testSlices.selector;
        SampleLibrary.testSignedBaseExponentiation.selector;
        SampleInterface.infFunc.selector;
    }

    function testUnassignedStorage(uint[] memory x) internal returns (uint[] memory) {
        data = x;
        uint[] storage s;
        s = data;
        return s;
    }

    receive() external payable {}

    fallback() external {}
}

contract CallDataUsage {
    /// State variable doc string
    uint[] internal values;

    function returnRow(uint[][] calldata rows, uint index) private pure returns (uint[] calldata) {
        require(rows.length > index, "Rows does not contain index");
        uint[] calldata row = rows[index];
        return row;
    }

    function addOwners(uint[][] calldata rows) public {
        uint[] calldata row = returnRow(rows, 0);
        checkUnique(row);
        for (uint i = 0; i < row.length; i++) {
            values.push(row[i]);
        }
    }

    function checkUnique(uint[] calldata newValues) internal pure {
        for (uint i = 0; i < newValues.length; i++) {
            for (uint j = i + 1; i < newValues.length; j++) {
                require(newValues[i] != newValues[i]);
            }
        }
    }
}

interface SomeInterface {
    function addr() external pure returns (address payable);
}

contract PublicVarOverride is SomeInterface {
    /// State variable overriding interface function by getter.
    address payable public immutable override addr = address(0x0);
}
// PragmaDirective#1 (167:23:0) -> 0:23:0
// PragmaDirective#2 (191:33:0) -> 24:33:0
// PragmaDirective#3 (225:31:0) -> 58:31:0
// EnumValue#4 (280:1:0) -> 113:1:0
// EnumValue#5 (287:1:0) -> 120:1:0
// EnumValue#6 (294:1:0) -> 127:1:0
// EnumDefinition#7 (258:39:0) -> 91:39:0
// ElementaryTypeName#8 (325:3:0) -> 158:3:0
// VariableDeclaration#9 (325:5:0) -> 158:5:0
// ElementaryTypeName#10 (336:4:0) -> 169:4:0
// ArrayTypeName#11 (336:6:0) -> 169:6:0
// VariableDeclaration#12 (336:8:0) -> 169:8:0
// ElementaryTypeName#13 (358:7:0) -> 191:7:0
// ElementaryTypeName#14 (369:4:0) -> 202:4:0
// Mapping#15 (350:24:0) -> 183:24:0
// VariableDeclaration#16 (350:26:0) -> 183:26:0
// UserDefinedTypeName#17 (390:10:0) -> 223:10:0
// ElementaryTypeName#18 (404:7:0) -> 237:7:0
// Mapping#19 (382:30:0) -> 215:30:0
// VariableDeclaration#20 (382:32:0) -> 215:32:0
// UserDefinedTypeName#21 (428:5:0) -> 261:5:0
// ElementaryTypeName#22 (437:4:0) -> 270:4:0
// Mapping#23 (420:22:0) -> 253:22:0
// VariableDeclaration#24 (420:24:0) -> 253:24:0
// StructDefinition#25 (299:148:0) -> 132:148:0
// StructuredDocumentation#26 (449:65:0) -> 282:62:0
// ElementaryTypeName#27 (580:3:0) -> 411:3:0
// VariableDeclaration#28 (580:8:0) -> 411:8:0
// ElementaryTypeName#29 (590:4:0) -> 421:4:0
// VariableDeclaration#30 (590:8:0) -> 421:8:0
// ParameterList#31 (579:20:0) -> 410:20:0
// ElementaryTypeName#32 (616:3:0) -> 447:3:0
// VariableDeclaration#33 (616:3:0) -> 447:3:0
// ParameterList#34 (615:5:0) -> 446:5:0
// Identifier#35 (639:4:0) -> 470:4:0
// Identifier#36 (647:3:0) -> 478:3:0
// BinaryOperation#37 (639:11:0) -> 470:11:0
// TupleExpression#38 (638:13:0) -> 469:13:0
// Return#39 (631:20:0) -> 462:20:0
// Block#40 (621:37:0) -> 452:37:0
// FunctionDefinition#41 (542:116:0) -> 373:116:0
// ContractDefinition#42 (514:146:0) -> 345:146:0
// StructuredDocumentation#43 (662:74:0) -> 493:71:0
// ElementaryTypeName#44 (785:6:0) -> 614:6:0
// VariableDeclaration#45 (785:17:0) -> 614:17:0
// ParameterList#46 (784:19:0) -> 613:19:0
// ElementaryTypeName#47 (822:5:0) -> 651:5:0
// VariableDeclaration#48 (822:12:0) -> 651:12:0
// ParameterList#49 (821:14:0) -> 650:14:0
// FunctionDefinition#50 (768:68:0) -> 597:68:0
// ContractDefinition#51 (736:102:0) -> 565:102:0
// ElementaryTypeName#52 (879:3:0) -> 708:3:0
// VariableDeclaration#53 (879:17:0) -> 708:17:0
// StructuredDocumentation#54 (903:36:0) -> 732:35:0
// ElementaryTypeName#55 (965:3:0) -> 793:3:0
// VariableDeclaration#56 (965:5:0) -> 793:5:0
// ParameterList#57 (964:7:0) -> 792:7:0
// ModifierDefinition#58 (944:36:0) -> 772:36:0
// ElementaryTypeName#59 (998:3:0) -> 826:3:0
// VariableDeclaration#60 (998:5:0) -> 826:5:0
// ParameterList#61 (997:7:0) -> 825:7:0
// Identifier#63 (1022:4:0) -> 850:4:0
// Identifier#64 (1029:1:0) -> 857:1:0
// Assignment#65 (1022:8:0) -> 850:8:0
// ExpressionStatement#66 (1022:8:0) -> 850:8:0
// Block#67 (1012:25:0) -> 840:25:0
// FunctionDefinition#68 (986:51:0) -> 814:51:0
// ElementaryTypeName#69 (1065:7:0) -> 893:7:0
// VariableDeclaration#70 (1065:9:0) -> 893:9:0
// ParameterList#71 (1064:11:0) -> 892:11:0
// ElementaryTypeName#72 (1102:15:0) -> 930:15:0
// VariableDeclaration#73 (1102:15:0) -> 930:15:0
// ParameterList#74 (1101:17:0) -> 929:17:0
// FunctionDefinition#75 (1043:76:0) -> 871:76:0
// ContractDefinition#76 (840:281:0) -> 669:280:0
// StructuredDocumentation#77 (1123:36:0) -> 951:34:0
// ContractDefinition#78 (1159:17:0) -> 986:17:0
// ParameterList#79 (1217:2:0) -> 1044:2:0
// Block#81 (1235:2:0) -> 1062:2:0
// FunctionDefinition#82 (1206:31:0) -> 1033:31:0
// ContractDefinition#83 (1178:61:0) -> 1005:61:0
// UserDefinedTypeName#84 (1264:14:0) -> 1091:14:0
// Literal#85 (1279:1:0) -> 1106:1:0
// InheritanceSpecifier#86 (1264:17:0) -> 1091:17:0
// StructuredDocumentation#87 (1288:38:0) -> 1115:38:0
// ElementaryTypeName#88 (1343:7:0) -> 1170:7:0
// VariableDeclaration#89 (1343:14:0) -> 1170:14:0
// ElementaryTypeName#90 (1359:6:0) -> 1186:6:0
// VariableDeclaration#91 (1359:14:0) -> 1186:14:0
// ParameterList#92 (1342:32:0) -> 1169:32:0
// EventDefinition#93 (1331:44:0) -> 1158:44:0
// ElementaryTypeName#94 (1381:4:0) -> 1208:4:0
// Literal#95 (1415:1:0) -> 1242:1:0
// VariableDeclaration#96 (1381:35:0) -> 1208:35:0
// ElementaryTypeName#97 (1422:4:0) -> 1249:4:0
// Literal#98 (1462:1:0) -> 1289:1:0
// VariableDeclaration#99 (1422:41:0) -> 1249:41:0
// ElementaryTypeName#100 (1469:4:0) -> 1296:4:0
// VariableDeclaration#101 (1469:35:0) -> 1296:35:0
// ElementaryTypeName#102 (1510:4:0) -> 1337:4:0
// ArrayTypeName#103 (1510:6:0) -> 1337:6:0
// VariableDeclaration#104 (1510:20:0) -> 1337:20:0
// StructuredDocumentation#105 (1537:47:0) -> 1364:46:0
// ElementaryTypeName#106 (1610:3:0) -> 1436:3:0
// VariableDeclaration#107 (1610:5:0) -> 1436:5:0
// ParameterList#108 (1609:7:0) -> 1435:7:0
// OverrideSpecifier#109 (1617:8:0) -> 1443:8:0
// PlaceholderStatement#110 (1636:1:0) -> 1462:1:0
// Identifier#111 (1647:4:0) -> 1473:4:0
// Identifier#112 (1655:1:0) -> 1481:1:0
// Assignment#113 (1647:9:0) -> 1473:9:0
// ExpressionStatement#114 (1647:9:0) -> 1473:9:0
// Block#115 (1626:37:0) -> 1452:37:0
// ModifierDefinition#116 (1589:74:0) -> 1415:74:0
// StructuredDocumentation#117 (1669:89:0) -> 1495:87:0
// ParameterList#118 (1794:2:0) -> 1618:2:0
// Identifier#119 (1807:7:0) -> 1631:7:0
// Identifier#120 (1815:4:0) -> 1639:4:0
// Literal#121 (1822:1:0) -> 1646:1:0
// BinaryOperation#122 (1815:8:0) -> 1639:8:0
// Literal#123 (1825:9:0) -> 1649:9:0
// FunctionCall#124 (1807:28:0) -> 1631:28:0
// ExpressionStatement#125 (1807:28:0) -> 1631:28:0
// PlaceholderStatement#126 (1845:1:0) -> 1669:1:0
// Block#127 (1797:56:0) -> 1621:56:0
// ModifierDefinition#128 (1763:90:0) -> 1587:90:0
// ElementaryTypeName#129 (1882:6:0) -> 1706:6:0
// VariableDeclaration#130 (1882:21:0) -> 1706:21:0
// ParameterList#131 (1881:23:0) -> 1705:23:0
// PlaceholderStatement#132 (1915:1:0) -> 1739:1:0
// Identifier#133 (1931:5:0) -> 1755:5:0
// ElementaryTypeName#134 (1937:7:0) -> 1761:7:0
// ElementaryTypeNameExpression#135 (1937:7:0) -> 1761:7:0
// Identifier#136 (1945:4:0) -> 1769:4:0
// FunctionCall#137 (1937:13:0) -> 1761:13:0
// Identifier#138 (1952:7:0) -> 1776:7:0
// FunctionCall#139 (1931:29:0) -> 1755:29:0
// EmitStatement#140 (1926:34:0) -> 1750:34:0
// Block#141 (1905:62:0) -> 1729:62:0
// ModifierDefinition#142 (1859:108:0) -> 1683:108:0
// ElementaryTypeName#143 (1985:4:0) -> 1809:4:0
// VariableDeclaration#144 (1985:6:0) -> 1809:6:0
// ParameterList#145 (1984:8:0) -> 1808:8:0
// Identifier#147 (2010:13:0) -> 1834:13:0
// Identifier#148 (2026:1:0) -> 1850:1:0
// Assignment#149 (2010:17:0) -> 1834:17:0
// ExpressionStatement#150 (2010:17:0) -> 1834:17:0
// Block#151 (2000:34:0) -> 1824:34:0
// FunctionDefinition#152 (1973:61:0) -> 1797:61:0
// ElementaryTypeName#153 (2062:7:0) -> 1886:7:0
// VariableDeclaration#154 (2062:9:0) -> 1886:9:0
// ParameterList#155 (2061:11:0) -> 1885:11:0
// OverrideSpecifier#156 (2073:8:0) -> 1897:8:0
// ElementaryTypeName#157 (2100:15:0) -> 1924:15:0
// VariableDeclaration#158 (2100:15:0) -> 1924:15:0
// ParameterList#159 (2099:17:0) -> 1923:17:0
// ElementaryTypeName#160 (2134:8:0) -> 1958:7:0
// ElementaryTypeNameExpression#161 (2134:8:0) -> 1958:7:0
// Identifier#162 (2142:1:0) -> 1966:1:0
// FunctionCall#163 (2134:10:0) -> 1958:10:0
// Return#164 (2127:17:0) -> 1951:17:0
// Block#165 (2117:34:0) -> 1941:34:0
// FunctionDefinition#166 (2040:111:0) -> 1864:111:0
// ParameterList#167 (2182:2:0) -> 2006:2:0
// Block#169 (2199:2:0) -> 2023:2:0
// FunctionDefinition#170 (2157:44:0) -> 1981:44:0
// ParameterList#171 (2226:2:0) -> 2050:2:0
// Identifier#173 (2246:6:0) -> 2070:6:0
// Identifier#174 (2253:4:0) -> 2077:4:0
// ElementaryTypeName#175 (2258:4:0) -> 2082:4:0
// ElementaryTypeNameExpression#176 (2258:4:0) -> 2082:4:0
// FunctionCall#177 (2253:10:0) -> 2077:10:0
// MemberAccess#178 (2253:14:0) -> 2077:14:0
// Literal#179 (2271:1:0) -> 2095:1:0
// BinaryOperation#180 (2253:19:0) -> 2077:19:0
// FunctionCall#181 (2246:27:0) -> 2070:27:0
// ExpressionStatement#182 (2246:27:0) -> 2070:27:0
// Identifier#183 (2283:6:0) -> 2107:6:0
// Identifier#184 (2290:4:0) -> 2114:4:0
// ElementaryTypeName#185 (2295:4:0) -> 2119:4:0
// ElementaryTypeNameExpression#186 (2295:4:0) -> 2119:4:0
// FunctionCall#187 (2290:10:0) -> 2114:10:0
// MemberAccess#188 (2290:14:0) -> 2114:14:0
// Literal#189 (2308:78:0) -> 2132:78:0
// BinaryOperation#190 (2290:96:0) -> 2114:96:0
// FunctionCall#191 (2283:104:0) -> 2107:104:0
// ExpressionStatement#192 (2283:104:0) -> 2107:104:0
// Identifier#193 (2397:6:0) -> 2221:6:0
// Identifier#194 (2404:4:0) -> 2228:4:0
// ElementaryTypeName#195 (2409:6:0) -> 2233:6:0
// ElementaryTypeNameExpression#196 (2409:6:0) -> 2233:6:0
// FunctionCall#197 (2404:12:0) -> 2228:12:0
// MemberAccess#198 (2404:16:0) -> 2228:16:0
// Literal#199 (2426:77:0) -> 2250:77:0
// UnaryOperation#200 (2425:78:0) -> 2249:78:0
// TupleExpression#201 (2424:80:0) -> 2248:80:0
// BinaryOperation#202 (2404:100:0) -> 2228:100:0
// FunctionCall#203 (2397:108:0) -> 2221:108:0
// ExpressionStatement#204 (2397:108:0) -> 2221:108:0
// Identifier#205 (2515:6:0) -> 2339:6:0
// Identifier#206 (2522:4:0) -> 2346:4:0
// ElementaryTypeName#207 (2527:6:0) -> 2351:6:0
// ElementaryTypeNameExpression#208 (2527:6:0) -> 2351:6:0
// FunctionCall#209 (2522:12:0) -> 2346:12:0
// MemberAccess#210 (2522:16:0) -> 2346:16:0
// Literal#211 (2542:77:0) -> 2366:77:0
// BinaryOperation#212 (2522:97:0) -> 2346:97:0
// FunctionCall#213 (2515:105:0) -> 2339:105:0
// ExpressionStatement#214 (2515:105:0) -> 2339:105:0
// Block#215 (2236:391:0) -> 2060:391:0
// FunctionDefinition#216 (2207:420:0) -> 2031:420:0
// StructuredDocumentation#217 (2633:26:0) -> 2457:26:0
// ParameterList#218 (2688:2:0) -> 2512:2:0
// ElementaryTypeName#219 (2712:6:0) -> 2536:6:0
// VariableDeclaration#220 (2712:6:0) -> 2536:6:0
// ParameterList#221 (2711:8:0) -> 2535:8:0
// Identifier#222 (2737:4:0) -> 2561:4:0
// Identifier#223 (2742:15:0) -> 2566:15:0
// FunctionCall#224 (2737:21:0) -> 2561:21:0
// MemberAccess#225 (2737:33:0) -> 2561:33:0
// Return#226 (2730:40:0) -> 2554:40:0
// Block#227 (2720:57:0) -> 2544:57:0
// FunctionDefinition#228 (2664:113:0) -> 2488:113:0
// StructuredDocumentation#229 (2783:31:0) -> 2607:31:0
// ParameterList#230 (2838:2:0) -> 2662:2:0
// ElementaryTypeName#232 (2864:4:0) -> 2688:4:0
// VariableDeclaration#233 (2864:6:0) -> 2688:6:0
// ElementaryTypeName#234 (2872:4:0) -> 2696:4:0
// VariableDeclaration#235 (2872:6:0) -> 2696:6:0
// Identifier#236 (2882:3:0) -> 2706:3:0
// MemberAccess#237 (2882:10:0) -> 2706:10:0
// Identifier#238 (2893:3:0) -> 2717:3:0
// MemberAccess#239 (2893:8:0) -> 2717:8:0
// Literal#240 (2902:1:0) -> 2726:1:0
// Literal#241 (2904:1:0) -> 2728:1:0
// IndexRangeAccess#242 (2893:13:0) -> 2717:13:0
// ElementaryTypeName#243 (2909:4:0) -> 2733:4:0
// ElementaryTypeNameExpression#244 (2909:4:0) -> 2733:4:0
// ElementaryTypeName#245 (2915:4:0) -> 2739:4:0
// ElementaryTypeNameExpression#246 (2915:4:0) -> 2739:4:0
// TupleExpression#247 (2908:12:0) -> 2732:12:0
// FunctionCall#248 (2882:39:0) -> 2706:39:0
// VariableDeclarationStatement#249 (2863:58:0) -> 2687:58:0
// ElementaryTypeName#250 (2932:4:0) -> 2756:4:0
// VariableDeclaration#251 (2932:6:0) -> 2756:6:0
// ElementaryTypeName#252 (2940:4:0) -> 2764:4:0
// VariableDeclaration#253 (2940:6:0) -> 2764:6:0
// Identifier#254 (2950:3:0) -> 2774:3:0
// MemberAccess#255 (2950:10:0) -> 2774:10:0
// Identifier#256 (2961:3:0) -> 2785:3:0
// MemberAccess#257 (2961:8:0) -> 2785:8:0
// Literal#258 (2971:1:0) -> 2795:1:0
// IndexRangeAccess#259 (2961:12:0) -> 2785:12:0
// ElementaryTypeName#260 (2976:4:0) -> 2800:4:0
// ElementaryTypeNameExpression#261 (2976:4:0) -> 2800:4:0
// ElementaryTypeName#262 (2982:4:0) -> 2806:4:0
// ElementaryTypeNameExpression#263 (2982:4:0) -> 2806:4:0
// TupleExpression#264 (2975:12:0) -> 2799:12:0
// FunctionCall#265 (2950:38:0) -> 2774:38:0
// VariableDeclarationStatement#266 (2931:57:0) -> 2755:57:0
// ElementaryTypeName#267 (2999:4:0) -> 2823:4:0
// VariableDeclaration#268 (2999:6:0) -> 2823:6:0
// ElementaryTypeName#269 (3007:4:0) -> 2831:4:0
// VariableDeclaration#270 (3007:6:0) -> 2831:6:0
// Identifier#271 (3017:3:0) -> 2841:3:0
// MemberAccess#272 (3017:10:0) -> 2841:10:0
// Identifier#273 (3028:3:0) -> 2852:3:0
// MemberAccess#274 (3028:8:0) -> 2852:8:0
// Literal#275 (3037:1:0) -> 2861:1:0
// IndexRangeAccess#276 (3028:12:0) -> 2852:12:0
// ElementaryTypeName#277 (3043:4:0) -> 2867:4:0
// ElementaryTypeNameExpression#278 (3043:4:0) -> 2867:4:0
// ElementaryTypeName#279 (3049:4:0) -> 2873:4:0
// ElementaryTypeNameExpression#280 (3049:4:0) -> 2873:4:0
// TupleExpression#281 (3042:12:0) -> 2866:12:0
// FunctionCall#282 (3017:38:0) -> 2841:38:0
// VariableDeclarationStatement#283 (2998:57:0) -> 2822:57:0
// ElementaryTypeName#284 (3066:4:0) -> 2890:4:0
// VariableDeclaration#285 (3066:6:0) -> 2890:6:0
// ElementaryTypeName#286 (3074:4:0) -> 2898:4:0
// VariableDeclaration#287 (3074:6:0) -> 2898:6:0
// Identifier#288 (3084:3:0) -> 2908:3:0
// MemberAccess#289 (3084:10:0) -> 2908:10:0
// Identifier#290 (3095:3:0) -> 2919:3:0
// MemberAccess#291 (3095:8:0) -> 2919:8:0
// IndexRangeAccess#292 (3095:11:0) -> 2919:11:0
// ElementaryTypeName#293 (3109:4:0) -> 2933:4:0
// ElementaryTypeNameExpression#294 (3109:4:0) -> 2933:4:0
// ElementaryTypeName#295 (3115:4:0) -> 2939:4:0
// ElementaryTypeNameExpression#296 (3115:4:0) -> 2939:4:0
// TupleExpression#297 (3108:12:0) -> 2932:12:0
// FunctionCall#298 (3084:37:0) -> 2908:37:0
// VariableDeclarationStatement#299 (3065:56:0) -> 2889:56:0
// ElementaryTypeName#300 (3132:4:0) -> 2956:4:0
// VariableDeclaration#301 (3132:6:0) -> 2956:6:0
// ElementaryTypeName#302 (3140:4:0) -> 2964:4:0
// VariableDeclaration#303 (3140:6:0) -> 2964:6:0
// Identifier#304 (3150:3:0) -> 2974:3:0
// MemberAccess#305 (3150:10:0) -> 2974:10:0
// Identifier#306 (3161:3:0) -> 2985:3:0
// MemberAccess#307 (3161:8:0) -> 2985:8:0
// ElementaryTypeName#308 (3172:4:0) -> 2996:4:0
// ElementaryTypeNameExpression#309 (3172:4:0) -> 2996:4:0
// ElementaryTypeName#310 (3178:4:0) -> 3002:4:0
// ElementaryTypeNameExpression#311 (3178:4:0) -> 3002:4:0
// TupleExpression#312 (3171:12:0) -> 2995:12:0
// FunctionCall#313 (3150:34:0) -> 2974:34:0
// VariableDeclarationStatement#314 (3131:53:0) -> 2955:53:0
// Block#315 (2853:338:0) -> 2677:338:0
// FunctionDefinition#316 (2819:372:0) -> 2643:372:0
// ParameterList#317 (3218:2:0) -> 3042:2:0
// Identifier#318 (3228:13:0) -> 3052:13:0
// Literal#319 (3242:25:0) -> 3066:25:0
// ModifierInvocation#320 (3228:40:0) -> 3052:40:0
// UserDefinedTypeName#322 (3287:5:0) -> 3111:5:0
// NewExpression#323 (3283:9:0) -> 3107:9:0
// FunctionCall#324 (3283:11:0) -> 3107:11:0
// ElementaryTypeName#325 (3309:3:0) -> 3133:3:0
// VariableDeclaration#326 (3309:5:0) -> 3133:5:0
// Literal#327 (3317:1:0) -> 3141:1:0
// VariableDeclarationStatement#328 (3309:9:0) -> 3133:9:0
// Block#329 (3295:34:0) -> 3119:34:0
// TryCatchClause#330 (3295:34:0) -> 3119:34:0
// ElementaryTypeName#331 (3350:3:0) -> 3174:3:0
// VariableDeclaration#332 (3350:5:0) -> 3174:5:0
// Literal#333 (3358:1:0) -> 3182:1:0
// VariableDeclarationStatement#334 (3350:9:0) -> 3174:9:0
// Block#335 (3336:34:0) -> 3160:34:0
// TryCatchClause#336 (3330:40:0) -> 3154:40:0
// TryStatement#337 (3279:91:0) -> 3103:91:0
// UserDefinedTypeName#338 (3387:12:0) -> 3211:12:0
// NewExpression#339 (3383:16:0) -> 3207:16:0
// Literal#340 (3406:3:0) -> 3230:3:0
// Literal#341 (3418:7:0) -> 3242:7:0
// FunctionCallOptions#342 (3383:43:0) -> 3207:43:0
// FunctionCall#343 (3383:45:0) -> 3207:45:0
// UserDefinedTypeName#344 (3438:12:0) -> 3262:12:0
// VariableDeclaration#345 (3438:14:0) -> 3262:14:0
// ParameterList#346 (3437:16:0) -> 3261:16:0
// ElementaryTypeName#347 (3468:3:0) -> 3292:3:0
// VariableDeclaration#348 (3468:5:0) -> 3292:5:0
// Literal#349 (3476:1:0) -> 3300:1:0
// VariableDeclarationStatement#350 (3468:9:0) -> 3292:9:0
// Block#351 (3454:34:0) -> 3278:34:0
// TryCatchClause#352 (3429:59:0) -> 3253:59:0
// ElementaryTypeName#353 (3501:6:0) -> 3325:6:0
// VariableDeclaration#354 (3501:20:0) -> 3325:20:0
// ParameterList#355 (3500:22:0) -> 3324:22:0
// Block#356 (3523:2:0) -> 3347:2:0
// TryCatchClause#357 (3489:36:0) -> 3313:36:0
// ElementaryTypeName#358 (3533:5:0) -> 3357:5:0
// VariableDeclaration#359 (3533:25:0) -> 3357:25:0
// ParameterList#360 (3532:27:0) -> 3356:27:0
// Block#361 (3560:2:0) -> 3384:2:0
// TryCatchClause#362 (3526:36:0) -> 3350:36:0
// TryStatement#363 (3379:183:0) -> 3203:183:0
// Block#364 (3269:299:0) -> 3093:299:0
// FunctionDefinition#365 (3197:371:0) -> 3021:371:0
// ParameterList#366 (3591:2:0) -> 3415:2:0
// Identifier#368 (3611:6:0) -> 3435:6:0
// Literal#369 (3618:6:0) -> 3442:6:0
// Literal#370 (3628:14:0) -> 3452:14:0
// BinaryOperation#371 (3618:24:0) -> 3442:24:0
// FunctionCall#372 (3611:32:0) -> 3435:32:0
// ExpressionStatement#373 (3611:32:0) -> 3435:32:0
// Identifier#374 (3653:6:0) -> 3477:6:0
// Literal#375 (3660:6:0) -> 3484:6:0
// Literal#376 (3670:11:0) -> 3494:11:0
// BinaryOperation#377 (3660:21:0) -> 3484:21:0
// FunctionCall#378 (3653:29:0) -> 3477:29:0
// ExpressionStatement#379 (3653:29:0) -> 3477:29:0
// Block#380 (3601:88:0) -> 3425:88:0
// FunctionDefinition#381 (3574:115:0) -> 3398:115:0
// ParameterList#382 (3722:2:0) -> 3546:2:0
// Identifier#383 (3734:22:0) -> 3558:22:0
// ModifierInvocation#384 (3734:24:0) -> 3558:24:0
// ElementaryTypeName#385 (3768:4:0) -> 3592:4:0
// VariableDeclaration#386 (3768:4:0) -> 3592:4:0
// ParameterList#387 (3767:6:0) -> 3591:6:0
// ElementaryTypeName#388 (3793:7:0) -> 3617:7:0
// VariableDeclaration#389 (3793:7:0) -> 3617:7:0
// ParameterList#390 (3792:9:0) -> 3616:9:0
// ElementaryTypeName#391 (3820:15:0) -> 3644:15:0
// VariableDeclaration#392 (3820:15:0) -> 3644:15:0
// ParameterList#393 (3819:17:0) -> 3643:17:0
// FunctionTypeName#394 (3784:62:0) -> 3608:52:0
// VariableDeclaration#395 (3784:62:0) -> 3608:62:0
// Identifier#396 (3849:10:0) -> 3673:10:0
// MemberAccess#397 (3849:23:0) -> 3673:23:0
// VariableDeclarationStatement#398 (3784:88:0) -> 3608:88:0
// ParameterList#399 (3890:2:0) -> 3714:2:0
// FunctionTypeName#401 (3882:28:0) -> 3706:24:0
// VariableDeclaration#402 (3882:28:0) -> 3706:28:0
// Identifier#403 (3913:10:0) -> 3737:10:0
// MemberAccess#404 (3913:27:0) -> 3737:27:0
// VariableDeclarationStatement#405 (3882:58:0) -> 3706:58:0
// ElementaryTypeName#408 (3950:4:0) -> 3774:4:0
// ArrayTypeName#409 (3950:6:0) -> 3774:6:0
// VariableDeclaration#410 (3950:18:0) -> 3774:18:0
// ElementaryTypeName#411 (3975:4:0) -> 3799:4:0
// ArrayTypeName#412 (3975:6:0) -> 3799:6:0
// NewExpression#413 (3971:10:0) -> 3795:10:0
// Literal#414 (3982:1:0) -> 3806:1:0
// FunctionCall#415 (3971:13:0) -> 3795:13:0
// VariableDeclarationStatement#416 (3950:34:0) -> 3774:34:0
// Identifier#417 (3994:4:0) -> 3818:4:0
// Literal#418 (3999:1:0) -> 3823:1:0
// IndexAccess#419 (3994:7:0) -> 3818:7:0
// Literal#420 (4004:1:0) -> 3828:1:0
// Assignment#421 (3994:11:0) -> 3818:11:0
// ExpressionStatement#422 (3994:11:0) -> 3818:11:0
// Identifier#423 (4015:4:0) -> 3839:4:0
// Literal#424 (4020:1:0) -> 3844:1:0
// IndexAccess#425 (4015:7:0) -> 3839:7:0
// Literal#426 (4025:1:0) -> 3849:1:0
// Assignment#427 (4015:11:0) -> 3839:11:0
// ExpressionStatement#428 (4015:11:0) -> 3839:11:0
// Identifier#429 (4036:4:0) -> 3860:4:0
// Literal#430 (4041:1:0) -> 3865:1:0
// IndexAccess#431 (4036:7:0) -> 3860:7:0
// Literal#432 (4046:1:0) -> 3870:1:0
// Assignment#433 (4036:11:0) -> 3860:11:0
// ExpressionStatement#434 (4036:11:0) -> 3860:11:0
// UserDefinedTypeName#435 (4057:12:0) -> 3881:12:0
// VariableDeclaration#436 (4057:21:0) -> 3881:21:0
// Identifier#437 (4081:12:0) -> 3905:12:0
// Literal#438 (4094:1:0) -> 3918:1:0
// Identifier#439 (4097:4:0) -> 3921:4:0
// FunctionCall#440 (4081:21:0) -> 3905:21:0
// VariableDeclarationStatement#441 (4057:45:0) -> 3881:45:0
// ElementaryTypeName#444 (4112:4:0) -> 3936:4:0
// ArrayTypeName#445 (4112:6:0) -> 3936:6:0
// VariableDeclaration#446 (4112:15:0) -> 3936:15:0
// Identifier#447 (4130:1:0) -> 3954:1:0
// MemberAccess#448 (4130:3:0) -> 3954:3:0
// VariableDeclarationStatement#449 (4112:21:0) -> 3936:21:0
// Identifier#450 (4150:1:0) -> 3974:1:0
// UnaryOperation#451 (4143:8:0) -> 3967:8:0
// ExpressionStatement#452 (4143:8:0) -> 3967:8:0
// ElementaryTypeName#453 (4161:4:0) -> 3985:4:0
// VariableDeclaration#454 (4161:6:0) -> 3985:6:0
// Identifier#455 (4170:1:0) -> 3994:1:0
// Literal#456 (4172:1:0) -> 3996:1:0
// IndexAccess#457 (4170:4:0) -> 3994:4:0
// VariableDeclarationStatement#458 (4161:13:0) -> 3985:13:0
// Identifier#459 (4191:1:0) -> 4015:1:0
// UnaryOperation#460 (4184:8:0) -> 4008:8:0
// ExpressionStatement#461 (4184:8:0) -> 4008:8:0
// Identifier#462 (4209:1:0) -> 4033:1:0
// Return#463 (4202:8:0) -> 4026:8:0
// Block#464 (3774:443:0) -> 3598:443:0
// FunctionDefinition#465 (3695:522:0) -> 3519:522:0
// ParameterList#466 (4245:2:0) -> 4069:2:0
// Identifier#468 (4265:4:0) -> 4089:4:0
// MemberAccess#471 (4265:15:0) -> 4089:15:0
// MemberAccess#472 (4265:24:0) -> 4089:24:0
// ExpressionStatement#473 (4265:24:0) -> 4089:24:0
// Identifier#474 (4299:13:0) -> 4123:13:0
// MemberAccess#477 (4299:42:0) -> 4123:42:0
// MemberAccess#478 (4299:51:0) -> 4123:51:0
// ExpressionStatement#479 (4299:51:0) -> 4123:51:0
// Identifier#480 (4360:15:0) -> 4184:15:0
// MemberAccess#483 (4360:23:0) -> 4184:23:0
// MemberAccess#484 (4360:32:0) -> 4184:32:0
// ExpressionStatement#485 (4360:32:0) -> 4184:32:0
// Block#486 (4255:144:0) -> 4079:144:0
// FunctionDefinition#487 (4223:176:0) -> 4047:176:0
// ElementaryTypeName#488 (4436:4:0) -> 4260:4:0
// ArrayTypeName#489 (4436:6:0) -> 4260:6:0
// VariableDeclaration#490 (4436:15:0) -> 4260:15:0
// ParameterList#491 (4435:17:0) -> 4259:17:0
// ElementaryTypeName#492 (4471:4:0) -> 4295:4:0
// ArrayTypeName#493 (4471:6:0) -> 4295:6:0
// VariableDeclaration#494 (4471:13:0) -> 4295:13:0
// ParameterList#495 (4470:15:0) -> 4294:15:0
// Identifier#496 (4496:4:0) -> 4320:4:0
// Identifier#497 (4503:1:0) -> 4327:1:0
// Assignment#498 (4496:8:0) -> 4320:8:0
// ExpressionStatement#499 (4496:8:0) -> 4320:8:0
// ElementaryTypeName#502 (4514:4:0) -> 4338:4:0
// ArrayTypeName#503 (4514:6:0) -> 4338:6:0
// VariableDeclaration#504 (4514:16:0) -> 4338:16:0
// VariableDeclarationStatement#505 (4514:16:0) -> 4338:16:0
// Identifier#506 (4540:1:0) -> 4364:1:0
// Identifier#507 (4544:4:0) -> 4368:4:0
// Assignment#508 (4540:8:0) -> 4364:8:0
// ExpressionStatement#509 (4540:8:0) -> 4364:8:0
// Identifier#510 (4565:1:0) -> 4389:1:0
// Return#511 (4558:8:0) -> 4382:8:0
// Block#512 (4486:87:0) -> 4310:87:0
// FunctionDefinition#513 (4405:168:0) -> 4229:168:0
// ParameterList#514 (4586:2:0) -> 4410:2:0
// Block#516 (4606:2:0) -> 4430:2:0
// FunctionDefinition#517 (4579:29:0) -> 4403:29:0
// ParameterList#518 (4622:2:0) -> 4446:2:0
// Block#520 (4634:2:0) -> 4458:2:0
// FunctionDefinition#521 (4614:22:0) -> 4438:22:0
// ContractDefinition#522 (1241:3397:0) -> 1068:3394:0
// StructuredDocumentation#523 (4669:29:0) -> 4493:29:0
// ElementaryTypeName#524 (4703:4:0) -> 4527:4:0
// ArrayTypeName#525 (4703:6:0) -> 4527:6:0
// VariableDeclaration#526 (4703:22:0) -> 4527:22:0
// ElementaryTypeName#527 (4751:4:0) -> 4575:4:0
// ArrayTypeName#528 (4751:6:0) -> 4575:6:0
// ArrayTypeName#529 (4751:8:0) -> 4575:8:0
// VariableDeclaration#530 (4751:22:0) -> 4575:22:0
// ElementaryTypeName#531 (4775:4:0) -> 4599:4:0
// VariableDeclaration#532 (4775:10:0) -> 4599:10:0
// ParameterList#533 (4750:36:0) -> 4574:36:0
// ElementaryTypeName#534 (4809:4:0) -> 4633:4:0
// ArrayTypeName#535 (4809:6:0) -> 4633:6:0
// VariableDeclaration#536 (4809:15:0) -> 4633:15:0
// ParameterList#537 (4808:17:0) -> 4632:17:0
// Identifier#538 (4836:7:0) -> 4660:7:0
// Identifier#539 (4844:4:0) -> 4668:4:0
// MemberAccess#540 (4844:11:0) -> 4668:11:0
// Identifier#541 (4858:5:0) -> 4682:5:0
// BinaryOperation#542 (4844:19:0) -> 4668:19:0
// Literal#543 (4865:29:0) -> 4689:29:0
// FunctionCall#544 (4836:59:0) -> 4660:59:0
// ExpressionStatement#545 (4836:59:0) -> 4660:59:0
// ElementaryTypeName#548 (4943:4:0) -> 4729:4:0
// ArrayTypeName#549 (4943:6:0) -> 4729:6:0
// VariableDeclaration#550 (4943:19:0) -> 4729:19:0
// Identifier#551 (4965:4:0) -> 4751:4:0
// Identifier#552 (4970:5:0) -> 4756:5:0
// IndexAccess#553 (4965:11:0) -> 4751:11:0
// VariableDeclarationStatement#554 (4943:33:0) -> 4729:33:0
// Identifier#555 (4993:3:0) -> 4779:3:0
// Return#556 (4986:10:0) -> 4772:10:0
// Block#557 (4826:177:0) -> 4650:139:0
// FunctionDefinition#558 (4732:271:0) -> 4556:233:0
// ElementaryTypeName#559 (5028:4:0) -> 4814:4:0
// ArrayTypeName#560 (5028:6:0) -> 4814:6:0
// ArrayTypeName#561 (5028:8:0) -> 4814:8:0
// VariableDeclaration#562 (5028:22:0) -> 4814:22:0
// ParameterList#563 (5027:24:0) -> 4813:24:0
// ElementaryTypeName#567 (5069:4:0) -> 4855:4:0
// ArrayTypeName#568 (5069:6:0) -> 4855:6:0
// VariableDeclaration#569 (5069:19:0) -> 4855:19:0
// Identifier#570 (5091:9:0) -> 4877:9:0
// Identifier#571 (5101:4:0) -> 4887:4:0
// Literal#572 (5107:1:0) -> 4893:1:0
// FunctionCall#573 (5091:18:0) -> 4877:18:0
// VariableDeclarationStatement#574 (5069:40:0) -> 4855:40:0
// Identifier#575 (5119:11:0) -> 4905:11:0
// Identifier#576 (5131:3:0) -> 4917:3:0
// FunctionCall#577 (5119:16:0) -> 4905:16:0
// ExpressionStatement#578 (5119:16:0) -> 4905:16:0
// ElementaryTypeName#579 (5150:4:0) -> 4936:4:0
// VariableDeclaration#580 (5150:6:0) -> 4936:6:0
// Literal#581 (5159:1:0) -> 4945:1:0
// VariableDeclarationStatement#582 (5150:10:0) -> 4936:10:0
// Identifier#583 (5162:1:0) -> 4948:1:0
// Identifier#584 (5166:3:0) -> 4952:3:0
// MemberAccess#585 (5166:10:0) -> 4952:10:0
// BinaryOperation#586 (5162:14:0) -> 4948:14:0
// Identifier#587 (5178:1:0) -> 4964:1:0
// UnaryOperation#588 (5178:3:0) -> 4964:3:0
// ExpressionStatement#589 (5178:3:0) -> 4964:3:0
// Identifier#590 (5197:6:0) -> 4983:6:0
// MemberAccess#592 (5197:11:0) -> 4983:11:0
// Identifier#593 (5209:3:0) -> 4995:3:0
// Identifier#594 (5213:1:0) -> 4999:1:0
// IndexAccess#595 (5209:6:0) -> 4995:6:0
// FunctionCall#596 (5197:19:0) -> 4983:19:0
// ExpressionStatement#597 (5197:19:0) -> 4983:19:0
// Block#598 (5183:44:0) -> 4969:44:0
// ForStatement#599 (5145:82:0) -> 4931:82:0
// Block#600 (5059:174:0) -> 4845:174:0
// FunctionDefinition#601 (5009:224:0) -> 4795:224:0
// ElementaryTypeName#602 (5260:4:0) -> 5046:4:0
// ArrayTypeName#603 (5260:6:0) -> 5046:6:0
// VariableDeclaration#604 (5260:25:0) -> 5046:25:0
// ParameterList#605 (5259:27:0) -> 5045:27:0
// ElementaryTypeName#607 (5316:4:0) -> 5102:4:0
// VariableDeclaration#608 (5316:6:0) -> 5102:6:0
// Literal#609 (5325:1:0) -> 5111:1:0
// VariableDeclarationStatement#610 (5316:10:0) -> 5102:10:0
// Identifier#611 (5328:1:0) -> 5114:1:0
// Identifier#612 (5332:9:0) -> 5118:9:0
// MemberAccess#613 (5332:16:0) -> 5118:16:0
// BinaryOperation#614 (5328:20:0) -> 5114:20:0
// Identifier#615 (5350:1:0) -> 5136:1:0
// UnaryOperation#616 (5350:3:0) -> 5136:3:0
// ExpressionStatement#617 (5350:3:0) -> 5136:3:0
// ElementaryTypeName#618 (5374:4:0) -> 5160:4:0
// VariableDeclaration#619 (5374:6:0) -> 5160:6:0
// Identifier#620 (5383:1:0) -> 5169:1:0
// Literal#621 (5387:1:0) -> 5173:1:0
// BinaryOperation#622 (5383:5:0) -> 5169:5:0
// VariableDeclarationStatement#623 (5374:14:0) -> 5160:14:0
// Identifier#624 (5390:1:0) -> 5176:1:0
// Identifier#625 (5394:9:0) -> 5180:9:0
// MemberAccess#626 (5394:16:0) -> 5180:16:0
// BinaryOperation#627 (5390:20:0) -> 5176:20:0
// Identifier#628 (5412:1:0) -> 5198:1:0
// UnaryOperation#629 (5412:3:0) -> 5198:3:0
// ExpressionStatement#630 (5412:3:0) -> 5198:3:0
// Identifier#631 (5435:7:0) -> 5221:7:0
// Identifier#632 (5443:9:0) -> 5229:9:0
// Identifier#633 (5453:1:0) -> 5239:1:0
// IndexAccess#634 (5443:12:0) -> 5229:12:0
// Identifier#635 (5459:9:0) -> 5245:9:0
// Identifier#636 (5469:1:0) -> 5255:1:0
// IndexAccess#637 (5459:12:0) -> 5245:12:0
// BinaryOperation#638 (5443:28:0) -> 5229:28:0
// FunctionCall#639 (5435:37:0) -> 5221:37:0
// ExpressionStatement#640 (5435:37:0) -> 5221:37:0
// Block#641 (5417:70:0) -> 5203:70:0
// ForStatement#642 (5369:118:0) -> 5155:118:0
// Block#643 (5355:142:0) -> 5141:142:0
// ForStatement#644 (5311:186:0) -> 5097:186:0
// Block#645 (5301:202:0) -> 5087:202:0
// FunctionDefinition#646 (5239:264:0) -> 5025:264:0
// ContractDefinition#647 (4640:865:0) -> 4464:827:0
// ParameterList#648 (5550:2:0) -> 5336:2:0
// ElementaryTypeName#649 (5576:15:0) -> 5362:15:0
// VariableDeclaration#650 (5576:15:0) -> 5362:15:0
// ParameterList#651 (5575:17:0) -> 5361:17:0
// FunctionDefinition#652 (5537:56:0) -> 5323:56:0
// ContractDefinition#653 (5507:88:0) -> 5293:88:0
// UserDefinedTypeName#654 (5627:13:0) -> 5413:13:0
// InheritanceSpecifier#655 (5627:13:0) -> 5413:13:0
// StructuredDocumentation#656 (5647:60:0) -> 5433:59:0
// ElementaryTypeName#657 (5712:15:0) -> 5497:15:0
// OverrideSpecifier#658 (5745:8:0) -> 5530:8:0
// ElementaryTypeName#659 (5761:7:0) -> 5546:7:0
// ElementaryTypeNameExpression#660 (5761:7:0) -> 5546:7:0
// Literal#661 (5769:3:0) -> 5554:3:0
// FunctionCall#662 (5761:12:0) -> 5546:12:0
// VariableDeclaration#663 (5712:61:0) -> 5497:61:0
// ContractDefinition#664 (5597:179:0) -> 5383:178:0
// SourceUnit#665 (167:5610:0) -> 0:5561:0
