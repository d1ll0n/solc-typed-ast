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

    function abstractFunc(address a) internal virtual returns (address payable);
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

    function abstractFunc(address a) internal override returns (address payable) {
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
        try new EmptyPayable{ salt: 0x0, value: 1 ether }() returns (EmptyPayable x) {
            int a = 1;
        } catch Error(string memory reason) {} catch (bytes memory lowLevelData) {}
    }

    function testGWei() public {
        assert(1 gwei == 1000000000 wei);
        assert(1 gwei == 0.001 szabo);
    }

    function basicFunctionality() internal onlyPositiveSomeBefore returns (uint) {
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
// StructuredDocumentation#26 (449:63:0) -> 282:62:0
// ElementaryTypeName#27 (578:3:0) -> 411:3:0
// VariableDeclaration#28 (578:8:0) -> 411:8:0
// ElementaryTypeName#29 (588:4:0) -> 421:4:0
// VariableDeclaration#30 (588:8:0) -> 421:8:0
// ParameterList#31 (577:20:0) -> 410:20:0
// ElementaryTypeName#32 (614:3:0) -> 447:3:0
// VariableDeclaration#33 (614:3:0) -> 447:3:0
// ParameterList#34 (613:5:0) -> 446:5:0
// Identifier#35 (637:4:0) -> 470:4:0
// Identifier#36 (645:3:0) -> 478:3:0
// BinaryOperation#37 (637:11:0) -> 470:11:0
// TupleExpression#38 (636:13:0) -> 469:13:0
// Return#39 (629:20:0) -> 462:20:0
// Block#40 (619:37:0) -> 452:37:0
// FunctionDefinition#41 (540:116:0) -> 373:116:0
// ContractDefinition#42 (512:146:0) -> 345:146:0
// StructuredDocumentation#43 (660:72:0) -> 493:71:0
// ElementaryTypeName#44 (781:6:0) -> 614:6:0
// VariableDeclaration#45 (781:17:0) -> 614:17:0
// ParameterList#46 (780:19:0) -> 613:19:0
// ElementaryTypeName#47 (818:5:0) -> 651:5:0
// VariableDeclaration#48 (818:12:0) -> 651:12:0
// ParameterList#49 (817:14:0) -> 650:14:0
// FunctionDefinition#50 (764:68:0) -> 597:68:0
// ContractDefinition#51 (732:102:0) -> 565:102:0
// ElementaryTypeName#52 (875:3:0) -> 708:3:0
// VariableDeclaration#53 (875:17:0) -> 708:17:0
// StructuredDocumentation#54 (899:35:0) -> 732:35:0
// ElementaryTypeName#55 (960:3:0) -> 793:3:0
// VariableDeclaration#56 (960:5:0) -> 793:5:0
// ParameterList#57 (959:7:0) -> 792:7:0
// ModifierDefinition#58 (939:36:0) -> 772:36:0
// ElementaryTypeName#59 (993:3:0) -> 826:3:0
// VariableDeclaration#60 (993:5:0) -> 826:5:0
// ParameterList#61 (992:7:0) -> 825:7:0
// Identifier#63 (1017:4:0) -> 850:4:0
// Identifier#64 (1024:1:0) -> 857:1:0
// Assignment#65 (1017:8:0) -> 850:8:0
// ExpressionStatement#66 (1017:8:0) -> 850:8:0
// Block#67 (1007:25:0) -> 840:25:0
// FunctionDefinition#68 (981:51:0) -> 814:51:0
// ElementaryTypeName#69 (1060:7:0) -> 893:7:0
// VariableDeclaration#70 (1060:9:0) -> 893:9:0
// ParameterList#71 (1059:11:0) -> 892:11:0
// ElementaryTypeName#72 (1097:15:0) -> 930:15:0
// VariableDeclaration#73 (1097:15:0) -> 930:15:0
// ParameterList#74 (1096:17:0) -> 929:17:0
// FunctionDefinition#75 (1038:76:0) -> 871:76:0
// ContractDefinition#76 (836:280:0) -> 669:280:0
// StructuredDocumentation#77 (1118:35:0) -> 951:34:0
// ContractDefinition#78 (1153:17:0) -> 986:17:0
// ParameterList#79 (1211:2:0) -> 1044:2:0
// Block#81 (1229:2:0) -> 1062:2:0
// FunctionDefinition#82 (1200:31:0) -> 1033:31:0
// ContractDefinition#83 (1172:61:0) -> 1005:61:0
// UserDefinedTypeName#84 (1258:14:0) -> 1091:14:0
// Literal#85 (1273:1:0) -> 1106:1:0
// InheritanceSpecifier#86 (1258:17:0) -> 1091:17:0
// StructuredDocumentation#87 (1282:38:0) -> 1115:38:0
// ElementaryTypeName#88 (1337:7:0) -> 1170:7:0
// VariableDeclaration#89 (1337:14:0) -> 1170:14:0
// ElementaryTypeName#90 (1353:6:0) -> 1186:6:0
// VariableDeclaration#91 (1353:14:0) -> 1186:14:0
// ParameterList#92 (1336:32:0) -> 1169:32:0
// EventDefinition#93 (1325:44:0) -> 1158:44:0
// ElementaryTypeName#94 (1375:4:0) -> 1208:4:0
// Literal#95 (1409:1:0) -> 1242:1:0
// VariableDeclaration#96 (1375:35:0) -> 1208:35:0
// ElementaryTypeName#97 (1416:4:0) -> 1249:4:0
// Literal#98 (1456:1:0) -> 1289:1:0
// VariableDeclaration#99 (1416:41:0) -> 1249:41:0
// ElementaryTypeName#100 (1463:4:0) -> 1296:4:0
// VariableDeclaration#101 (1463:35:0) -> 1296:35:0
// ElementaryTypeName#102 (1504:4:0) -> 1337:4:0
// ArrayTypeName#103 (1504:6:0) -> 1337:6:0
// VariableDeclaration#104 (1504:20:0) -> 1337:20:0
// StructuredDocumentation#105 (1531:46:0) -> 1364:46:0
// ElementaryTypeName#106 (1603:3:0) -> 1436:3:0
// VariableDeclaration#107 (1603:5:0) -> 1436:5:0
// ParameterList#108 (1602:7:0) -> 1435:7:0
// OverrideSpecifier#109 (1610:8:0) -> 1443:8:0
// PlaceholderStatement#110 (1629:1:0) -> 1462:1:0
// Identifier#111 (1640:4:0) -> 1473:4:0
// Identifier#112 (1648:1:0) -> 1481:1:0
// Assignment#113 (1640:9:0) -> 1473:9:0
// ExpressionStatement#114 (1640:9:0) -> 1473:9:0
// Block#115 (1619:37:0) -> 1452:37:0
// ModifierDefinition#116 (1582:74:0) -> 1415:74:0
// StructuredDocumentation#117 (1662:87:0) -> 1495:87:0
// ParameterList#118 (1785:2:0) -> 1618:2:0
// Identifier#119 (1798:7:0) -> 1631:7:0
// Identifier#120 (1806:4:0) -> 1639:4:0
// Literal#121 (1813:1:0) -> 1646:1:0
// BinaryOperation#122 (1806:8:0) -> 1639:8:0
// Literal#123 (1816:9:0) -> 1649:9:0
// FunctionCall#124 (1798:28:0) -> 1631:28:0
// ExpressionStatement#125 (1798:28:0) -> 1631:28:0
// PlaceholderStatement#126 (1836:1:0) -> 1669:1:0
// Block#127 (1788:56:0) -> 1621:56:0
// ModifierDefinition#128 (1754:90:0) -> 1587:90:0
// ElementaryTypeName#129 (1873:6:0) -> 1706:6:0
// VariableDeclaration#130 (1873:21:0) -> 1706:21:0
// ParameterList#131 (1872:23:0) -> 1705:23:0
// PlaceholderStatement#132 (1906:1:0) -> 1739:1:0
// Identifier#133 (1922:5:0) -> 1755:5:0
// ElementaryTypeName#134 (1928:7:0) -> 1761:7:0
// ElementaryTypeNameExpression#135 (1928:7:0) -> 1761:7:0
// Identifier#136 (1936:4:0) -> 1769:4:0
// FunctionCall#137 (1928:13:0) -> 1761:13:0
// Identifier#138 (1943:7:0) -> 1776:7:0
// FunctionCall#139 (1922:29:0) -> 1755:29:0
// EmitStatement#140 (1917:34:0) -> 1750:34:0
// Block#141 (1896:62:0) -> 1729:62:0
// ModifierDefinition#142 (1850:108:0) -> 1683:108:0
// ElementaryTypeName#143 (1976:4:0) -> 1809:4:0
// VariableDeclaration#144 (1976:6:0) -> 1809:6:0
// ParameterList#145 (1975:8:0) -> 1808:8:0
// Identifier#147 (2001:13:0) -> 1834:13:0
// Identifier#148 (2017:1:0) -> 1850:1:0
// Assignment#149 (2001:17:0) -> 1834:17:0
// ExpressionStatement#150 (2001:17:0) -> 1834:17:0
// Block#151 (1991:34:0) -> 1824:34:0
// FunctionDefinition#152 (1964:61:0) -> 1797:61:0
// ElementaryTypeName#153 (2053:7:0) -> 1886:7:0
// VariableDeclaration#154 (2053:9:0) -> 1886:9:0
// ParameterList#155 (2052:11:0) -> 1885:11:0
// OverrideSpecifier#156 (2073:8:0) -> 1906:8:0
// ElementaryTypeName#157 (2091:15:0) -> 1924:15:0
// VariableDeclaration#158 (2091:15:0) -> 1924:15:0
// ParameterList#159 (2090:17:0) -> 1923:17:0
// ElementaryTypeName#160 (2125:8:0) -> 1958:7:0
// ElementaryTypeNameExpression#161 (2125:8:0) -> 1958:7:0
// Identifier#162 (2133:1:0) -> 1966:1:0
// FunctionCall#163 (2125:10:0) -> 1958:10:0
// Return#164 (2118:17:0) -> 1951:17:0
// Block#165 (2108:34:0) -> 1941:34:0
// FunctionDefinition#166 (2031:111:0) -> 1864:111:0
// ParameterList#167 (2173:2:0) -> 2006:2:0
// Block#169 (2190:2:0) -> 2023:2:0
// FunctionDefinition#170 (2148:44:0) -> 1981:44:0
// ParameterList#171 (2217:2:0) -> 2050:2:0
// Identifier#173 (2237:6:0) -> 2070:6:0
// Identifier#174 (2244:4:0) -> 2077:4:0
// ElementaryTypeName#175 (2249:4:0) -> 2082:4:0
// ElementaryTypeNameExpression#176 (2249:4:0) -> 2082:4:0
// FunctionCall#177 (2244:10:0) -> 2077:10:0
// MemberAccess#178 (2244:14:0) -> 2077:14:0
// Literal#179 (2262:1:0) -> 2095:1:0
// BinaryOperation#180 (2244:19:0) -> 2077:19:0
// FunctionCall#181 (2237:27:0) -> 2070:27:0
// ExpressionStatement#182 (2237:27:0) -> 2070:27:0
// Identifier#183 (2274:6:0) -> 2107:6:0
// Identifier#184 (2281:4:0) -> 2114:4:0
// ElementaryTypeName#185 (2286:4:0) -> 2119:4:0
// ElementaryTypeNameExpression#186 (2286:4:0) -> 2119:4:0
// FunctionCall#187 (2281:10:0) -> 2114:10:0
// MemberAccess#188 (2281:14:0) -> 2114:14:0
// Literal#189 (2299:78:0) -> 2132:78:0
// BinaryOperation#190 (2281:96:0) -> 2114:96:0
// FunctionCall#191 (2274:104:0) -> 2107:104:0
// ExpressionStatement#192 (2274:104:0) -> 2107:104:0
// Identifier#193 (2388:6:0) -> 2221:6:0
// Identifier#194 (2395:4:0) -> 2228:4:0
// ElementaryTypeName#195 (2400:6:0) -> 2233:6:0
// ElementaryTypeNameExpression#196 (2400:6:0) -> 2233:6:0
// FunctionCall#197 (2395:12:0) -> 2228:12:0
// MemberAccess#198 (2395:16:0) -> 2228:16:0
// Literal#199 (2417:77:0) -> 2250:77:0
// UnaryOperation#200 (2416:78:0) -> 2249:78:0
// TupleExpression#201 (2415:80:0) -> 2248:80:0
// BinaryOperation#202 (2395:100:0) -> 2228:100:0
// FunctionCall#203 (2388:108:0) -> 2221:108:0
// ExpressionStatement#204 (2388:108:0) -> 2221:108:0
// Identifier#205 (2506:6:0) -> 2339:6:0
// Identifier#206 (2513:4:0) -> 2346:4:0
// ElementaryTypeName#207 (2518:6:0) -> 2351:6:0
// ElementaryTypeNameExpression#208 (2518:6:0) -> 2351:6:0
// FunctionCall#209 (2513:12:0) -> 2346:12:0
// MemberAccess#210 (2513:16:0) -> 2346:16:0
// Literal#211 (2533:77:0) -> 2366:77:0
// BinaryOperation#212 (2513:97:0) -> 2346:97:0
// FunctionCall#213 (2506:105:0) -> 2339:105:0
// ExpressionStatement#214 (2506:105:0) -> 2339:105:0
// Block#215 (2227:391:0) -> 2060:391:0
// FunctionDefinition#216 (2198:420:0) -> 2031:420:0
// StructuredDocumentation#217 (2624:26:0) -> 2457:26:0
// ParameterList#218 (2679:2:0) -> 2512:2:0
// ElementaryTypeName#219 (2703:6:0) -> 2536:6:0
// VariableDeclaration#220 (2703:6:0) -> 2536:6:0
// ParameterList#221 (2702:8:0) -> 2535:8:0
// Identifier#222 (2728:4:0) -> 2561:4:0
// Identifier#223 (2733:15:0) -> 2566:15:0
// FunctionCall#224 (2728:21:0) -> 2561:21:0
// MemberAccess#225 (2728:33:0) -> 2561:33:0
// Return#226 (2721:40:0) -> 2554:40:0
// Block#227 (2711:57:0) -> 2544:57:0
// FunctionDefinition#228 (2655:113:0) -> 2488:113:0
// StructuredDocumentation#229 (2774:31:0) -> 2607:31:0
// ParameterList#230 (2829:2:0) -> 2662:2:0
// ElementaryTypeName#232 (2855:4:0) -> 2688:4:0
// VariableDeclaration#233 (2855:6:0) -> 2688:6:0
// ElementaryTypeName#234 (2863:4:0) -> 2696:4:0
// VariableDeclaration#235 (2863:6:0) -> 2696:6:0
// Identifier#236 (2873:3:0) -> 2706:3:0
// MemberAccess#237 (2873:10:0) -> 2706:10:0
// Identifier#238 (2884:3:0) -> 2717:3:0
// MemberAccess#239 (2884:8:0) -> 2717:8:0
// Literal#240 (2893:1:0) -> 2726:1:0
// Literal#241 (2895:1:0) -> 2728:1:0
// IndexRangeAccess#242 (2884:13:0) -> 2717:13:0
// ElementaryTypeName#243 (2900:4:0) -> 2733:4:0
// ElementaryTypeNameExpression#244 (2900:4:0) -> 2733:4:0
// ElementaryTypeName#245 (2906:4:0) -> 2739:4:0
// ElementaryTypeNameExpression#246 (2906:4:0) -> 2739:4:0
// TupleExpression#247 (2899:12:0) -> 2732:12:0
// FunctionCall#248 (2873:39:0) -> 2706:39:0
// VariableDeclarationStatement#249 (2854:58:0) -> 2687:58:0
// ElementaryTypeName#250 (2923:4:0) -> 2756:4:0
// VariableDeclaration#251 (2923:6:0) -> 2756:6:0
// ElementaryTypeName#252 (2931:4:0) -> 2764:4:0
// VariableDeclaration#253 (2931:6:0) -> 2764:6:0
// Identifier#254 (2941:3:0) -> 2774:3:0
// MemberAccess#255 (2941:10:0) -> 2774:10:0
// Identifier#256 (2952:3:0) -> 2785:3:0
// MemberAccess#257 (2952:8:0) -> 2785:8:0
// Literal#258 (2962:1:0) -> 2795:1:0
// IndexRangeAccess#259 (2952:12:0) -> 2785:12:0
// ElementaryTypeName#260 (2967:4:0) -> 2800:4:0
// ElementaryTypeNameExpression#261 (2967:4:0) -> 2800:4:0
// ElementaryTypeName#262 (2973:4:0) -> 2806:4:0
// ElementaryTypeNameExpression#263 (2973:4:0) -> 2806:4:0
// TupleExpression#264 (2966:12:0) -> 2799:12:0
// FunctionCall#265 (2941:38:0) -> 2774:38:0
// VariableDeclarationStatement#266 (2922:57:0) -> 2755:57:0
// ElementaryTypeName#267 (2990:4:0) -> 2823:4:0
// VariableDeclaration#268 (2990:6:0) -> 2823:6:0
// ElementaryTypeName#269 (2998:4:0) -> 2831:4:0
// VariableDeclaration#270 (2998:6:0) -> 2831:6:0
// Identifier#271 (3008:3:0) -> 2841:3:0
// MemberAccess#272 (3008:10:0) -> 2841:10:0
// Identifier#273 (3019:3:0) -> 2852:3:0
// MemberAccess#274 (3019:8:0) -> 2852:8:0
// Literal#275 (3028:1:0) -> 2861:1:0
// IndexRangeAccess#276 (3019:12:0) -> 2852:12:0
// ElementaryTypeName#277 (3034:4:0) -> 2867:4:0
// ElementaryTypeNameExpression#278 (3034:4:0) -> 2867:4:0
// ElementaryTypeName#279 (3040:4:0) -> 2873:4:0
// ElementaryTypeNameExpression#280 (3040:4:0) -> 2873:4:0
// TupleExpression#281 (3033:12:0) -> 2866:12:0
// FunctionCall#282 (3008:38:0) -> 2841:38:0
// VariableDeclarationStatement#283 (2989:57:0) -> 2822:57:0
// ElementaryTypeName#284 (3057:4:0) -> 2890:4:0
// VariableDeclaration#285 (3057:6:0) -> 2890:6:0
// ElementaryTypeName#286 (3065:4:0) -> 2898:4:0
// VariableDeclaration#287 (3065:6:0) -> 2898:6:0
// Identifier#288 (3075:3:0) -> 2908:3:0
// MemberAccess#289 (3075:10:0) -> 2908:10:0
// Identifier#290 (3086:3:0) -> 2919:3:0
// MemberAccess#291 (3086:8:0) -> 2919:8:0
// IndexRangeAccess#292 (3086:11:0) -> 2919:11:0
// ElementaryTypeName#293 (3100:4:0) -> 2933:4:0
// ElementaryTypeNameExpression#294 (3100:4:0) -> 2933:4:0
// ElementaryTypeName#295 (3106:4:0) -> 2939:4:0
// ElementaryTypeNameExpression#296 (3106:4:0) -> 2939:4:0
// TupleExpression#297 (3099:12:0) -> 2932:12:0
// FunctionCall#298 (3075:37:0) -> 2908:37:0
// VariableDeclarationStatement#299 (3056:56:0) -> 2889:56:0
// ElementaryTypeName#300 (3123:4:0) -> 2956:4:0
// VariableDeclaration#301 (3123:6:0) -> 2956:6:0
// ElementaryTypeName#302 (3131:4:0) -> 2964:4:0
// VariableDeclaration#303 (3131:6:0) -> 2964:6:0
// Identifier#304 (3141:3:0) -> 2974:3:0
// MemberAccess#305 (3141:10:0) -> 2974:10:0
// Identifier#306 (3152:3:0) -> 2985:3:0
// MemberAccess#307 (3152:8:0) -> 2985:8:0
// ElementaryTypeName#308 (3163:4:0) -> 2996:4:0
// ElementaryTypeNameExpression#309 (3163:4:0) -> 2996:4:0
// ElementaryTypeName#310 (3169:4:0) -> 3002:4:0
// ElementaryTypeNameExpression#311 (3169:4:0) -> 3002:4:0
// TupleExpression#312 (3162:12:0) -> 2995:12:0
// FunctionCall#313 (3141:34:0) -> 2974:34:0
// VariableDeclarationStatement#314 (3122:53:0) -> 2955:53:0
// Block#315 (2844:338:0) -> 2677:338:0
// FunctionDefinition#316 (2810:372:0) -> 2643:372:0
// ParameterList#317 (3209:2:0) -> 3042:2:0
// Identifier#318 (3219:13:0) -> 3052:13:0
// Literal#319 (3233:25:0) -> 3066:25:0
// ModifierInvocation#320 (3219:40:0) -> 3052:40:0
// UserDefinedTypeName#322 (3278:5:0) -> 3111:5:0
// NewExpression#323 (3274:9:0) -> 3107:9:0
// FunctionCall#324 (3274:11:0) -> 3107:11:0
// ElementaryTypeName#325 (3300:3:0) -> 3133:3:0
// VariableDeclaration#326 (3300:5:0) -> 3133:5:0
// Literal#327 (3308:1:0) -> 3141:1:0
// VariableDeclarationStatement#328 (3300:9:0) -> 3133:9:0
// Block#329 (3286:34:0) -> 3119:34:0
// TryCatchClause#330 (3286:34:0) -> 3119:34:0
// ElementaryTypeName#331 (3341:3:0) -> 3174:3:0
// VariableDeclaration#332 (3341:5:0) -> 3174:5:0
// Literal#333 (3349:1:0) -> 3182:1:0
// VariableDeclarationStatement#334 (3341:9:0) -> 3174:9:0
// Block#335 (3327:34:0) -> 3160:34:0
// TryCatchClause#336 (3321:40:0) -> 3154:40:0
// TryStatement#337 (3270:91:0) -> 3103:91:0
// UserDefinedTypeName#338 (3378:12:0) -> 3211:12:0
// NewExpression#339 (3374:16:0) -> 3207:16:0
// Literal#340 (3398:3:0) -> 3231:3:0
// Literal#341 (3410:7:0) -> 3243:7:0
// FunctionCallOptions#342 (3374:45:0) -> 3207:45:0
// FunctionCall#343 (3374:47:0) -> 3207:47:0
// UserDefinedTypeName#344 (3431:12:0) -> 3264:12:0
// VariableDeclaration#345 (3431:14:0) -> 3264:14:0
// ParameterList#346 (3430:16:0) -> 3263:16:0
// ElementaryTypeName#347 (3461:3:0) -> 3294:3:0
// VariableDeclaration#348 (3461:5:0) -> 3294:5:0
// Literal#349 (3469:1:0) -> 3302:1:0
// VariableDeclarationStatement#350 (3461:9:0) -> 3294:9:0
// Block#351 (3447:34:0) -> 3280:34:0
// TryCatchClause#352 (3422:59:0) -> 3255:59:0
// ElementaryTypeName#353 (3494:6:0) -> 3327:6:0
// VariableDeclaration#354 (3494:20:0) -> 3327:20:0
// ParameterList#355 (3493:22:0) -> 3326:22:0
// Block#356 (3516:2:0) -> 3349:2:0
// TryCatchClause#357 (3482:36:0) -> 3315:36:0
// ElementaryTypeName#358 (3526:5:0) -> 3359:5:0
// VariableDeclaration#359 (3526:25:0) -> 3359:25:0
// ParameterList#360 (3525:27:0) -> 3358:27:0
// Block#361 (3553:2:0) -> 3386:2:0
// TryCatchClause#362 (3519:36:0) -> 3352:36:0
// TryStatement#363 (3370:185:0) -> 3203:185:0
// Block#364 (3260:301:0) -> 3093:301:0
// FunctionDefinition#365 (3188:373:0) -> 3021:373:0
// ParameterList#366 (3584:2:0) -> 3417:2:0
// Identifier#368 (3604:6:0) -> 3437:6:0
// Literal#369 (3611:6:0) -> 3444:6:0
// Literal#370 (3621:14:0) -> 3454:14:0
// BinaryOperation#371 (3611:24:0) -> 3444:24:0
// FunctionCall#372 (3604:32:0) -> 3437:32:0
// ExpressionStatement#373 (3604:32:0) -> 3437:32:0
// Identifier#374 (3646:6:0) -> 3479:6:0
// Literal#375 (3653:6:0) -> 3486:6:0
// Literal#376 (3663:11:0) -> 3496:11:0
// BinaryOperation#377 (3653:21:0) -> 3486:21:0
// FunctionCall#378 (3646:29:0) -> 3479:29:0
// ExpressionStatement#379 (3646:29:0) -> 3479:29:0
// Block#380 (3594:88:0) -> 3427:88:0
// FunctionDefinition#381 (3567:115:0) -> 3400:115:0
// ParameterList#382 (3715:2:0) -> 3548:2:0
// Identifier#383 (3727:22:0) -> 3560:22:0
// ModifierInvocation#384 (3727:22:0) -> 3560:22:0
// ElementaryTypeName#385 (3759:4:0) -> 3592:4:0
// VariableDeclaration#386 (3759:4:0) -> 3592:4:0
// ParameterList#387 (3758:6:0) -> 3591:6:0
// ElementaryTypeName#388 (3784:7:0) -> 3617:7:0
// VariableDeclaration#389 (3784:7:0) -> 3617:7:0
// ParameterList#390 (3783:9:0) -> 3616:9:0
// ElementaryTypeName#391 (3811:15:0) -> 3644:15:0
// VariableDeclaration#392 (3811:15:0) -> 3644:15:0
// ParameterList#393 (3810:17:0) -> 3643:17:0
// FunctionTypeName#394 (3775:62:0) -> 3608:52:0
// VariableDeclaration#395 (3775:62:0) -> 3608:62:0
// Identifier#396 (3840:10:0) -> 3673:10:0
// MemberAccess#397 (3840:23:0) -> 3673:23:0
// VariableDeclarationStatement#398 (3775:88:0) -> 3608:88:0
// ParameterList#399 (3881:2:0) -> 3714:2:0
// FunctionTypeName#401 (3873:28:0) -> 3706:24:0
// VariableDeclaration#402 (3873:28:0) -> 3706:28:0
// Identifier#403 (3904:10:0) -> 3737:10:0
// MemberAccess#404 (3904:27:0) -> 3737:27:0
// VariableDeclarationStatement#405 (3873:58:0) -> 3706:58:0
// ElementaryTypeName#408 (3941:4:0) -> 3774:4:0
// ArrayTypeName#409 (3941:6:0) -> 3774:6:0
// VariableDeclaration#410 (3941:18:0) -> 3774:18:0
// ElementaryTypeName#411 (3966:4:0) -> 3799:4:0
// ArrayTypeName#412 (3966:6:0) -> 3799:6:0
// NewExpression#413 (3962:10:0) -> 3795:10:0
// Literal#414 (3973:1:0) -> 3806:1:0
// FunctionCall#415 (3962:13:0) -> 3795:13:0
// VariableDeclarationStatement#416 (3941:34:0) -> 3774:34:0
// Identifier#417 (3985:4:0) -> 3818:4:0
// Literal#418 (3990:1:0) -> 3823:1:0
// IndexAccess#419 (3985:7:0) -> 3818:7:0
// Literal#420 (3995:1:0) -> 3828:1:0
// Assignment#421 (3985:11:0) -> 3818:11:0
// ExpressionStatement#422 (3985:11:0) -> 3818:11:0
// Identifier#423 (4006:4:0) -> 3839:4:0
// Literal#424 (4011:1:0) -> 3844:1:0
// IndexAccess#425 (4006:7:0) -> 3839:7:0
// Literal#426 (4016:1:0) -> 3849:1:0
// Assignment#427 (4006:11:0) -> 3839:11:0
// ExpressionStatement#428 (4006:11:0) -> 3839:11:0
// Identifier#429 (4027:4:0) -> 3860:4:0
// Literal#430 (4032:1:0) -> 3865:1:0
// IndexAccess#431 (4027:7:0) -> 3860:7:0
// Literal#432 (4037:1:0) -> 3870:1:0
// Assignment#433 (4027:11:0) -> 3860:11:0
// ExpressionStatement#434 (4027:11:0) -> 3860:11:0
// UserDefinedTypeName#435 (4048:12:0) -> 3881:12:0
// VariableDeclaration#436 (4048:21:0) -> 3881:21:0
// Identifier#437 (4072:12:0) -> 3905:12:0
// Literal#438 (4085:1:0) -> 3918:1:0
// Identifier#439 (4088:4:0) -> 3921:4:0
// FunctionCall#440 (4072:21:0) -> 3905:21:0
// VariableDeclarationStatement#441 (4048:45:0) -> 3881:45:0
// ElementaryTypeName#444 (4103:4:0) -> 3936:4:0
// ArrayTypeName#445 (4103:6:0) -> 3936:6:0
// VariableDeclaration#446 (4103:15:0) -> 3936:15:0
// Identifier#447 (4121:1:0) -> 3954:1:0
// MemberAccess#448 (4121:3:0) -> 3954:3:0
// VariableDeclarationStatement#449 (4103:21:0) -> 3936:21:0
// Identifier#450 (4141:1:0) -> 3974:1:0
// UnaryOperation#451 (4134:8:0) -> 3967:8:0
// ExpressionStatement#452 (4134:8:0) -> 3967:8:0
// ElementaryTypeName#453 (4152:4:0) -> 3985:4:0
// VariableDeclaration#454 (4152:6:0) -> 3985:6:0
// Identifier#455 (4161:1:0) -> 3994:1:0
// Literal#456 (4163:1:0) -> 3996:1:0
// IndexAccess#457 (4161:4:0) -> 3994:4:0
// VariableDeclarationStatement#458 (4152:13:0) -> 3985:13:0
// Identifier#459 (4182:1:0) -> 4015:1:0
// UnaryOperation#460 (4175:8:0) -> 4008:8:0
// ExpressionStatement#461 (4175:8:0) -> 4008:8:0
// Identifier#462 (4200:1:0) -> 4033:1:0
// Return#463 (4193:8:0) -> 4026:8:0
// Block#464 (3765:443:0) -> 3598:443:0
// FunctionDefinition#465 (3688:520:0) -> 3521:520:0
// ParameterList#466 (4236:2:0) -> 4069:2:0
// Identifier#468 (4256:4:0) -> 4089:4:0
// MemberAccess#471 (4256:15:0) -> 4089:15:0
// MemberAccess#472 (4256:24:0) -> 4089:24:0
// ExpressionStatement#473 (4256:24:0) -> 4089:24:0
// Identifier#474 (4290:13:0) -> 4123:13:0
// MemberAccess#477 (4290:42:0) -> 4123:42:0
// MemberAccess#478 (4290:51:0) -> 4123:51:0
// ExpressionStatement#479 (4290:51:0) -> 4123:51:0
// Identifier#480 (4351:15:0) -> 4184:15:0
// MemberAccess#483 (4351:23:0) -> 4184:23:0
// MemberAccess#484 (4351:32:0) -> 4184:32:0
// ExpressionStatement#485 (4351:32:0) -> 4184:32:0
// Block#486 (4246:144:0) -> 4079:144:0
// FunctionDefinition#487 (4214:176:0) -> 4047:176:0
// ElementaryTypeName#488 (4427:4:0) -> 4260:4:0
// ArrayTypeName#489 (4427:6:0) -> 4260:6:0
// VariableDeclaration#490 (4427:15:0) -> 4260:15:0
// ParameterList#491 (4426:17:0) -> 4259:17:0
// ElementaryTypeName#492 (4462:4:0) -> 4295:4:0
// ArrayTypeName#493 (4462:6:0) -> 4295:6:0
// VariableDeclaration#494 (4462:13:0) -> 4295:13:0
// ParameterList#495 (4461:15:0) -> 4294:15:0
// Identifier#496 (4487:4:0) -> 4320:4:0
// Identifier#497 (4494:1:0) -> 4327:1:0
// Assignment#498 (4487:8:0) -> 4320:8:0
// ExpressionStatement#499 (4487:8:0) -> 4320:8:0
// ElementaryTypeName#502 (4505:4:0) -> 4338:4:0
// ArrayTypeName#503 (4505:6:0) -> 4338:6:0
// VariableDeclaration#504 (4505:16:0) -> 4338:16:0
// VariableDeclarationStatement#505 (4505:16:0) -> 4338:16:0
// Identifier#506 (4531:1:0) -> 4364:1:0
// Identifier#507 (4535:4:0) -> 4368:4:0
// Assignment#508 (4531:8:0) -> 4364:8:0
// ExpressionStatement#509 (4531:8:0) -> 4364:8:0
// Identifier#510 (4556:1:0) -> 4389:1:0
// Return#511 (4549:8:0) -> 4382:8:0
// Block#512 (4477:87:0) -> 4310:87:0
// FunctionDefinition#513 (4396:168:0) -> 4229:168:0
// ParameterList#514 (4577:2:0) -> 4410:2:0
// Block#516 (4597:2:0) -> 4430:2:0
// FunctionDefinition#517 (4570:29:0) -> 4403:29:0
// ParameterList#518 (4613:2:0) -> 4446:2:0
// Block#520 (4625:2:0) -> 4458:2:0
// FunctionDefinition#521 (4605:22:0) -> 4438:22:0
// ContractDefinition#522 (1235:3394:0) -> 1068:3394:0
// StructuredDocumentation#523 (4660:29:0) -> 4493:29:0
// ElementaryTypeName#524 (4694:4:0) -> 4527:4:0
// ArrayTypeName#525 (4694:6:0) -> 4527:6:0
// VariableDeclaration#526 (4694:22:0) -> 4527:22:0
// ElementaryTypeName#527 (4742:4:0) -> 4575:4:0
// ArrayTypeName#528 (4742:6:0) -> 4575:6:0
// ArrayTypeName#529 (4742:8:0) -> 4575:8:0
// VariableDeclaration#530 (4742:22:0) -> 4575:22:0
// ElementaryTypeName#531 (4766:4:0) -> 4599:4:0
// VariableDeclaration#532 (4766:10:0) -> 4599:10:0
// ParameterList#533 (4741:36:0) -> 4574:36:0
// ElementaryTypeName#534 (4800:4:0) -> 4633:4:0
// ArrayTypeName#535 (4800:6:0) -> 4633:6:0
// VariableDeclaration#536 (4800:15:0) -> 4633:15:0
// ParameterList#537 (4799:17:0) -> 4632:17:0
// Identifier#538 (4827:7:0) -> 4660:7:0
// Identifier#539 (4835:4:0) -> 4668:4:0
// MemberAccess#540 (4835:11:0) -> 4668:11:0
// Identifier#541 (4849:5:0) -> 4682:5:0
// BinaryOperation#542 (4835:19:0) -> 4668:19:0
// Literal#543 (4856:29:0) -> 4689:29:0
// FunctionCall#544 (4827:59:0) -> 4660:59:0
// ExpressionStatement#545 (4827:59:0) -> 4660:59:0
// ElementaryTypeName#548 (4934:4:0) -> 4729:4:0
// ArrayTypeName#549 (4934:6:0) -> 4729:6:0
// VariableDeclaration#550 (4934:19:0) -> 4729:19:0
// Identifier#551 (4956:4:0) -> 4751:4:0
// Identifier#552 (4961:5:0) -> 4756:5:0
// IndexAccess#553 (4956:11:0) -> 4751:11:0
// VariableDeclarationStatement#554 (4934:33:0) -> 4729:33:0
// Identifier#555 (4984:3:0) -> 4779:3:0
// Return#556 (4977:10:0) -> 4772:10:0
// Block#557 (4817:177:0) -> 4650:139:0
// FunctionDefinition#558 (4723:271:0) -> 4556:233:0
// ElementaryTypeName#559 (5019:4:0) -> 4814:4:0
// ArrayTypeName#560 (5019:6:0) -> 4814:6:0
// ArrayTypeName#561 (5019:8:0) -> 4814:8:0
// VariableDeclaration#562 (5019:22:0) -> 4814:22:0
// ParameterList#563 (5018:24:0) -> 4813:24:0
// ElementaryTypeName#567 (5060:4:0) -> 4855:4:0
// ArrayTypeName#568 (5060:6:0) -> 4855:6:0
// VariableDeclaration#569 (5060:19:0) -> 4855:19:0
// Identifier#570 (5082:9:0) -> 4877:9:0
// Identifier#571 (5092:4:0) -> 4887:4:0
// Literal#572 (5098:1:0) -> 4893:1:0
// FunctionCall#573 (5082:18:0) -> 4877:18:0
// VariableDeclarationStatement#574 (5060:40:0) -> 4855:40:0
// Identifier#575 (5110:11:0) -> 4905:11:0
// Identifier#576 (5122:3:0) -> 4917:3:0
// FunctionCall#577 (5110:16:0) -> 4905:16:0
// ExpressionStatement#578 (5110:16:0) -> 4905:16:0
// ElementaryTypeName#579 (5141:4:0) -> 4936:4:0
// VariableDeclaration#580 (5141:6:0) -> 4936:6:0
// Literal#581 (5150:1:0) -> 4945:1:0
// VariableDeclarationStatement#582 (5141:10:0) -> 4936:10:0
// Identifier#583 (5153:1:0) -> 4948:1:0
// Identifier#584 (5157:3:0) -> 4952:3:0
// MemberAccess#585 (5157:10:0) -> 4952:10:0
// BinaryOperation#586 (5153:14:0) -> 4948:14:0
// Identifier#587 (5169:1:0) -> 4964:1:0
// UnaryOperation#588 (5169:3:0) -> 4964:3:0
// ExpressionStatement#589 (5169:3:0) -> 4964:3:0
// Identifier#590 (5188:6:0) -> 4983:6:0
// MemberAccess#592 (5188:11:0) -> 4983:11:0
// Identifier#593 (5200:3:0) -> 4995:3:0
// Identifier#594 (5204:1:0) -> 4999:1:0
// IndexAccess#595 (5200:6:0) -> 4995:6:0
// FunctionCall#596 (5188:19:0) -> 4983:19:0
// ExpressionStatement#597 (5188:19:0) -> 4983:19:0
// Block#598 (5174:44:0) -> 4969:44:0
// ForStatement#599 (5136:82:0) -> 4931:82:0
// Block#600 (5050:174:0) -> 4845:174:0
// FunctionDefinition#601 (5000:224:0) -> 4795:224:0
// ElementaryTypeName#602 (5251:4:0) -> 5046:4:0
// ArrayTypeName#603 (5251:6:0) -> 5046:6:0
// VariableDeclaration#604 (5251:25:0) -> 5046:25:0
// ParameterList#605 (5250:27:0) -> 5045:27:0
// ElementaryTypeName#607 (5307:4:0) -> 5102:4:0
// VariableDeclaration#608 (5307:6:0) -> 5102:6:0
// Literal#609 (5316:1:0) -> 5111:1:0
// VariableDeclarationStatement#610 (5307:10:0) -> 5102:10:0
// Identifier#611 (5319:1:0) -> 5114:1:0
// Identifier#612 (5323:9:0) -> 5118:9:0
// MemberAccess#613 (5323:16:0) -> 5118:16:0
// BinaryOperation#614 (5319:20:0) -> 5114:20:0
// Identifier#615 (5341:1:0) -> 5136:1:0
// UnaryOperation#616 (5341:3:0) -> 5136:3:0
// ExpressionStatement#617 (5341:3:0) -> 5136:3:0
// ElementaryTypeName#618 (5365:4:0) -> 5160:4:0
// VariableDeclaration#619 (5365:6:0) -> 5160:6:0
// Identifier#620 (5374:1:0) -> 5169:1:0
// Literal#621 (5378:1:0) -> 5173:1:0
// BinaryOperation#622 (5374:5:0) -> 5169:5:0
// VariableDeclarationStatement#623 (5365:14:0) -> 5160:14:0
// Identifier#624 (5381:1:0) -> 5176:1:0
// Identifier#625 (5385:9:0) -> 5180:9:0
// MemberAccess#626 (5385:16:0) -> 5180:16:0
// BinaryOperation#627 (5381:20:0) -> 5176:20:0
// Identifier#628 (5403:1:0) -> 5198:1:0
// UnaryOperation#629 (5403:3:0) -> 5198:3:0
// ExpressionStatement#630 (5403:3:0) -> 5198:3:0
// Identifier#631 (5426:7:0) -> 5221:7:0
// Identifier#632 (5434:9:0) -> 5229:9:0
// Identifier#633 (5444:1:0) -> 5239:1:0
// IndexAccess#634 (5434:12:0) -> 5229:12:0
// Identifier#635 (5450:9:0) -> 5245:9:0
// Identifier#636 (5460:1:0) -> 5255:1:0
// IndexAccess#637 (5450:12:0) -> 5245:12:0
// BinaryOperation#638 (5434:28:0) -> 5229:28:0
// FunctionCall#639 (5426:37:0) -> 5221:37:0
// ExpressionStatement#640 (5426:37:0) -> 5221:37:0
// Block#641 (5408:70:0) -> 5203:70:0
// ForStatement#642 (5360:118:0) -> 5155:118:0
// Block#643 (5346:142:0) -> 5141:142:0
// ForStatement#644 (5302:186:0) -> 5097:186:0
// Block#645 (5292:202:0) -> 5087:202:0
// FunctionDefinition#646 (5230:264:0) -> 5025:264:0
// ContractDefinition#647 (4631:865:0) -> 4464:827:0
// ParameterList#648 (5541:2:0) -> 5336:2:0
// ElementaryTypeName#649 (5567:15:0) -> 5362:15:0
// VariableDeclaration#650 (5567:15:0) -> 5362:15:0
// ParameterList#651 (5566:17:0) -> 5361:17:0
// FunctionDefinition#652 (5528:56:0) -> 5323:56:0
// ContractDefinition#653 (5498:88:0) -> 5293:88:0
// UserDefinedTypeName#654 (5618:13:0) -> 5413:13:0
// InheritanceSpecifier#655 (5618:13:0) -> 5413:13:0
// StructuredDocumentation#656 (5638:59:0) -> 5433:59:0
// ElementaryTypeName#657 (5702:15:0) -> 5497:15:0
// OverrideSpecifier#658 (5735:8:0) -> 5530:8:0
// ElementaryTypeName#659 (5751:7:0) -> 5546:7:0
// ElementaryTypeNameExpression#660 (5751:7:0) -> 5546:7:0
// Literal#661 (5759:3:0) -> 5554:3:0
// FunctionCall#662 (5751:12:0) -> 5546:12:0
// VariableDeclaration#663 (5702:61:0) -> 5497:61:0
// ContractDefinition#664 (5588:178:0) -> 5383:178:0
// SourceUnit#665 (167:5600:0) -> 0:5561:0
