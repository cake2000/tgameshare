var BABYLONX;
(function (BABYLONX) {
    var ShaderMaterialHelperStatics = (function () {
        function ShaderMaterialHelperStatics() {
        }
        return ShaderMaterialHelperStatics;
    }());
    ShaderMaterialHelperStatics.Dark = false;
    ShaderMaterialHelperStatics.Light = true;
    ShaderMaterialHelperStatics.PrecisionHighMode = 'highp';
    ShaderMaterialHelperStatics.PrecisionMediumMode = 'mediump';
    ShaderMaterialHelperStatics.face_back = "!gl_FrontFacing";
    ShaderMaterialHelperStatics.face_front = "gl_FrontFacing";
    ShaderMaterialHelperStatics.AttrPosition = 'position';
    ShaderMaterialHelperStatics.AttrNormal = 'normal';
    ShaderMaterialHelperStatics.AttrUv = 'uv';
    ShaderMaterialHelperStatics.AttrUv2 = 'uv2';
    ShaderMaterialHelperStatics.AttrTypeForPosition = 'vec3';
    ShaderMaterialHelperStatics.AttrTypeForNormal = 'vec3';
    ShaderMaterialHelperStatics.AttrTypeForUv = 'vec2';
    ShaderMaterialHelperStatics.AttrTypeForUv2 = 'vec2';
    ShaderMaterialHelperStatics.uniformView = "view";
    ShaderMaterialHelperStatics.uniformWorld = "world";
    ShaderMaterialHelperStatics.uniformWorldView = "worldView";
    ShaderMaterialHelperStatics.uniformViewProjection = "viewProjection";
    ShaderMaterialHelperStatics.uniformWorldViewProjection = "worldViewProjection";
    ShaderMaterialHelperStatics.uniformStandardType = "mat4";
    ShaderMaterialHelperStatics.uniformFlags = "flags";
    ShaderMaterialHelperStatics.Mouse = "mouse";
    ShaderMaterialHelperStatics.Screen = "screen";
    ShaderMaterialHelperStatics.Camera = "camera";
    ShaderMaterialHelperStatics.Look = "look";
    ShaderMaterialHelperStatics.Time = "time";
    ShaderMaterialHelperStatics.GlobalTime = "gtime";
    ShaderMaterialHelperStatics.Position = "pos";
    ShaderMaterialHelperStatics.WorldPosition = "wpos";
    ShaderMaterialHelperStatics.Normal = "nrm";
    ShaderMaterialHelperStatics.WorldNormal = "wnrm";
    ShaderMaterialHelperStatics.Uv = "vuv";
    ShaderMaterialHelperStatics.Uv2 = "vuv2";
    ShaderMaterialHelperStatics.Center = 'center';
    ShaderMaterialHelperStatics.ReflectMatrix = "refMat";
    ShaderMaterialHelperStatics.Texture2D = "txtRef_";
    ShaderMaterialHelperStatics.TextureCube = "cubeRef_";
    BABYLONX.ShaderMaterialHelperStatics = ShaderMaterialHelperStatics;
    var Normals = (function () {
        function Normals() {
        }
        return Normals;
    }());
    Normals.Default = ShaderMaterialHelperStatics.Normal;
    Normals.Inverse = '-1.*' + ShaderMaterialHelperStatics.Normal;
    Normals.Pointed = 'normalize(' + ShaderMaterialHelperStatics.Position + '-' + ShaderMaterialHelperStatics.Center + ')';
    Normals.Flat = 'normalize(cross(dFdx(' + ShaderMaterialHelperStatics.Position + ' * -1.), dFdy(' + ShaderMaterialHelperStatics.Position + ')))';
    Normals.Map = 'normalMap()';
    BABYLONX.Normals = Normals;
    var Speculars = (function () {
        function Speculars() {
        }
        return Speculars;
    }());
    Speculars.Map = 'specularMap()';
    BABYLONX.Speculars = Speculars;
    var ShaderMaterialHelper = (function () {
        function ShaderMaterialHelper() {
        }
        ShaderMaterialHelper.prototype.ShaderMaterial = function (name, scene, shader, helpers) {
            return this.MakeShaderMaterialForEngine(name, scene, shader, helpers);
        };
        ShaderMaterialHelper.prototype.MakeShaderMaterialForEngine = function (name, scene, shader, helpers) { return {}; };
        ShaderMaterialHelper.prototype.DefineTexture = function (txt, scene) {
            return null;
        };
        ShaderMaterialHelper.prototype.DefineCubeTexture = function (txt, scene) {
            return null;
        };
        ShaderMaterialHelper.prototype.SetUniforms = function (meshes, cameraPos, cameraTarget, mouse, screen, time) {
        };
        ShaderMaterialHelper.prototype.PostProcessTextures = function (pps, name, txt) { };
        ShaderMaterialHelper.prototype.DefineRenderTarget = function (name, scale, scene) {
            return {};
        };
        ShaderMaterialHelper.prototype.ShaderPostProcess = function (name, samplers, camera, scale, shader, helpers, option) {
            return {};
        };
        return ShaderMaterialHelper;
    }());
    BABYLONX.ShaderMaterialHelper = ShaderMaterialHelper;
    var Shader = (function () {
        function Shader() {
        }
        Shader.Replace = function (s, t, d) {
            var ignore = null;
            return s.replace(new RegExp(t.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (d) == "string") ? d.replace(/\$/g, "$$$$") : d);
        };
        Shader.Def = function (a, d) {
            if (a != undefined && a != null)
                return (d != undefined && d != null ? a : true);
            else if (d != Shader._null)
                return (d != undefined && d != null ? d : false);
            return null;
        };
        Shader.Join = function (s) {
            return s.join("\n\
                       ");
        };
        Shader.Print = function (n) {
            if (n == undefined)
                return "0.";
            var sn = Shader.Replace(n.toString(), '-', '0');
            var reg = new RegExp('^\\d+$');
            if (reg.test(sn) && n.toString().indexOf('.') == -1)
                return n + ".";
            return n.toString();
        };
        Shader.Custom = function () {
            return "custom_" + this.Print(++this.Me.CustomIndexer) + "_";
        };
        Shader.Index = function () {
            return "_" + Shader.Indexer + "_";
        };
        Shader.DefCustom = function (t, c) {
            this.Me.Body += t + " custom_" + this.Print(++this.Me.CustomIndexer) + "_ = " + c + ";";
        };
        Shader.toRGB = function (a, b) {
            b = Shader.Def(b, 255);
            var x = a - Math.floor(a / b) * b;
            a = Math.floor(a / b);
            var y = a - Math.floor(a / b) * b;
            a = Math.floor(a / b);
            var z = a - Math.floor(a / b) * b;
            if (x > 126)
                x++;
            if (y > 126)
                y++;
            if (z > 126)
                z++;
            return { r: x, g: y, b: z };
        };
        Shader.torgb = function (a, b) {
            b = Shader.Def(b, 255);
            var i = Shader.toRGB(a, b);
            return { r: i.r / 256, g: i.g / 256, b: i.b / 256 };
        };
        Shader.toID = function (a, b) {
            b = Shader.Def(b, 255);
            var c = 255 / b;
            var x = Math.floor(a.r / c);
            var y = Math.floor(a.g / c);
            var z = Math.floor(a.b / c);
            return z * b * b + y * b + x;
        };
        return Shader;
    }());
    Shader._null = 'set null anyway';
    BABYLONX.Shader = Shader;
    var Helper = (function () {
        function Helper() {
            var setting = Shader.Me.Setting;
            var instance = new ShaderBuilder();
            instance.Parent = Shader.Me;
            instance.Setting = setting;
            return instance;
        }
        Helper.Depth = function (far) {
            return 'max(0.,min(1.,(' + Shader.Print(far) + '-abs(length(camera-pos)))/' + Shader.Print(far) + ' ))';
        };
        return Helper;
    }());
    Helper.Red = 0;
    Helper.Yellow = 1;
    Helper.White = 2;
    Helper.Cyan = 4;
    Helper.Blue = 5;
    Helper.Pink = 6;
    Helper.Black = 7;
    Helper.Green = 8;
    BABYLONX.Helper = Helper;
    var ShaderSetting = (function () {
        function ShaderSetting() {
            this.PrecisionMode = ShaderMaterialHelperStatics.PrecisionHighMode;
        }
        return ShaderSetting;
    }());
    BABYLONX.ShaderSetting = ShaderSetting;
    var ShaderBuilder = (function () {
        function ShaderBuilder() {
            this.Setting = new ShaderSetting();
            this.Extentions = [];
            this.Attributes = [];
            this.Fragment = [];
            this.Helpers = [];
            this.Uniforms = [];
            this.Varings = [];
            this.Vertex = [];
            this.Setting.Uv = true;
            this.Setting.Time = true;
            this.Setting.Camera = true;
            this.Setting.Helpers = true;
            this.Setting.NormalMap = "result = vec4(0.5);";
            this.Setting.SpecularMap = "float_result = 1.0;";
            this.Setting.NormalOpacity = "0.5";
            this.Setting.Normal = ShaderMaterialHelperStatics.Normal;
            if (Shader.Indexer == null)
                Shader.Indexer = 1;
            this.CustomIndexer = 1;
            Shader.Me = this;
        }
        ShaderBuilder.InitializeEngine = function () {
            eval(Shader.Replace(Shader.Replace("BABYLONX.ShaderMaterialHelper.prototype.MakeShaderMaterialForEngine=function(name,scene,shader,helpers){BABYLON.Effect.ShadersStore[name+#[QT]VertexShader#[QT]]=shader.Vertex;BABYLON.Effect.ShadersStore[name+#[QT]PixelShader#[QT]]=shader.Pixel;return new BABYLON.ShaderMaterial(name,scene,{vertex:name,fragment:name},helpers);}", "#[QT]", '"'), '#[T]', "'"));
            eval(Shader.Replace(Shader.Replace("BABYLONX.ShaderMaterialHelper.prototype.DefineTexture = function (option, sc) { var tx = new BABYLON.Texture(option, sc); return tx; } ", "#[QT]", '"'), '#[T]', "'"));
            eval(Shader.Replace(Shader.Replace("BABYLONX.ShaderMaterialHelper.prototype.DefineCubeTexture = function (option, sc) { var tx = new BABYLON.CubeTexture(option, sc); tx.coordinatesMode = BABYLON.Texture.PLANAR_MODE; return tx; }  ", "#[QT]", '"'), '#[T]', "'"));
            eval(Shader.Replace(Shader.Replace("BABYLONX.ShaderMaterialHelper.prototype.SetUniforms = function (meshes, cameraPos, cameraTarget, mouse, screen, time) { for (var ms in meshes) { ms = meshes[ms]; if (ms.material && (ms.material.ShaderSetting != null || ms.material.ShaderSetting != undefined)) { if (ms.material.ShaderSetting.Camera)                ms.material.setVector3(BABYLONX.ShaderMaterialHelperStatics.Camera, cameraPos); if (ms.material.ShaderSetting.Center)                ms.material.setVector3(BABYLONX.ShaderMaterialHelperStatics.Center, { x: 0., y: 0., z: 0. }); if (ms.material.ShaderSetting.Mouse)                ms.material.setVector2(BABYLONX.ShaderMaterialHelperStatics.Mouse, mouse); if (ms.material.ShaderSetting.Screen)                ms.material.setVector2(BABYLONX.ShaderMaterialHelperStatics.Screen, screen); if (ms.material.ShaderSetting.GlobalTime)                ms.material.setVector4(BABYLONX.ShaderMaterialHelperStatics.GlobalTime, { x: 0., y: 0., z: 0., w: 0. }); if (ms.material.ShaderSetting.Look)                ms.material.setVector3(BABYLONX.ShaderMaterialHelperStatics.Look, cameraTarget); if (ms.material.ShaderSetting.Time)                ms.material.setFloat(BABYLONX.ShaderMaterialHelperStatics.Time, time);        }        }    }", "#[QT]", '"'), '#[T]', "'"));
            eval(Shader.Replace(Shader.Replace("BABYLONX.ShaderMaterialHelper.prototype.ShaderPostProcess = function (name, samplers, camera, scale, shader, helpers, option) {if (!option) option = {};if (!option.samplingMode) option.samplingMode = BABYLON.Texture.BILINEAR_SAMPLINGMODE;BABYLON.Effect.ShadersStore[name + #[QT]PixelShader#[QT]] = shader.Pixel;var pps = new BABYLON.PostProcess(name, name, helpers.uniforms, samplers, scale, camera, option.samplingMode);pps.onApply = function (effect) {effect.setFloat(#[T]time#[T], time);effect.setVector2(#[QT]screen#[QT], { x: pps.width, y: pps.height });effect.setVector3(#[QT]camera#[QT], camera.position);if (option && option.onApply)option.onApply(effect);};return pps;} ", "#[QT]", '"'), '#[T]', "'"));
            eval(Shader.Replace(Shader.Replace("BABYLONX.ShaderMaterialHelper.prototype.PostProcessTextures = function (pps, name, txt) {pps._effect.setTexture(name, txt);}", "#[QT]", '"'), '#[T]', "'"));
        };
        ShaderBuilder.InitializePostEffects = function (scene, scale) {
            ShaderBuilder.ColorIdRenderTarget = new ShaderMaterialHelper().DefineRenderTarget("ColorId", scale, scene);
        };
        ShaderBuilder.prototype.PrepareBeforeMaterialBuild = function () {
            this.Setting = Shader.Me.Setting;
            this.Attributes.push(ShaderMaterialHelperStatics.AttrPosition);
            this.Attributes.push(ShaderMaterialHelperStatics.AttrNormal);
            if (this.Setting.Uv) {
                this.Attributes.push(ShaderMaterialHelperStatics.AttrUv);
            }
            if (this.Setting.Uv2) {
                this.Attributes.push(ShaderMaterialHelperStatics.AttrUv2);
            }
            this.Uniforms.push(ShaderMaterialHelperStatics.uniformView, ShaderMaterialHelperStatics.uniformWorld, ShaderMaterialHelperStatics.uniformWorldView, ShaderMaterialHelperStatics.uniformViewProjection, ShaderMaterialHelperStatics.uniformWorldViewProjection);
            // start Build Vertex Frame 
            this.Vertex.push("precision " + this.Setting.PrecisionMode + " float;");
            this.Vertex.push("attribute " + ShaderMaterialHelperStatics.AttrTypeForPosition + " " + ShaderMaterialHelperStatics.AttrPosition + ";");
            this.Vertex.push("attribute " + ShaderMaterialHelperStatics.AttrTypeForNormal + " " + ShaderMaterialHelperStatics.AttrNormal + ";");
            if (this.Setting.Uv) {
                this.Vertex.push("attribute " + ShaderMaterialHelperStatics.AttrTypeForUv + " " + ShaderMaterialHelperStatics.AttrUv + ";");
                this.Vertex.push("varying vec2 " + ShaderMaterialHelperStatics.Uv + ";");
            }
            if (this.Setting.Uv2) {
                this.Vertex.push("attribute " + ShaderMaterialHelperStatics.AttrTypeForUv2 + " " + ShaderMaterialHelperStatics.AttrUv2 + ";");
                this.Vertex.push("varying vec2 " + ShaderMaterialHelperStatics.Uv2 + ";");
            }
            this.Vertex.push("varying vec3 " + ShaderMaterialHelperStatics.Position + ";");
            this.Vertex.push("varying vec3 " + ShaderMaterialHelperStatics.Normal + ";");
            this.Vertex.push("uniform   " + ShaderMaterialHelperStatics.uniformStandardType + ' ' + ShaderMaterialHelperStatics.uniformWorldViewProjection + ";");
            if (this.Setting.VertexView) {
                this.Vertex.push("uniform   " + ShaderMaterialHelperStatics.uniformStandardType + ' ' + ShaderMaterialHelperStatics.uniformView + ";");
            }
            if (this.Setting.VertexWorld) {
                this.Vertex.push("uniform   " + ShaderMaterialHelperStatics.uniformStandardType + ' ' + ShaderMaterialHelperStatics.uniformWorld + ";");
            }
            if (this.Setting.VertexViewProjection) {
                this.Vertex.push("uniform   " + ShaderMaterialHelperStatics.uniformStandardType + ' ' + ShaderMaterialHelperStatics.uniformViewProjection + ";");
            }
            if (this.Setting.Flags) {
                this.Uniforms.push(ShaderMaterialHelperStatics.uniformFlags);
                this.Vertex.push("uniform  float " + ShaderMaterialHelperStatics.uniformFlags + ";");
            }
            if (this.Setting.VertexWorldView) {
                this.Vertex.push("uniform   " + ShaderMaterialHelperStatics.uniformStandardType + ' ' + ShaderMaterialHelperStatics.uniformWorldView + ";");
            }
            if (this.VertexUniforms) {
                this.Vertex.push(this.VertexUniforms);
            }
            /*#extension GL_OES_standard_derivatives : enable*/
            this.Fragment.push("precision " + this.Setting.PrecisionMode + " float;\n\
#extension GL_OES_standard_derivatives : enable\n\
\n\
\n\
 ");
            if (this.Setting.Uv) {
                this.Fragment.push("varying vec2 " + ShaderMaterialHelperStatics.Uv + ";");
            }
            if (this.Setting.Uv2) {
                this.Fragment.push("varying vec2 " + ShaderMaterialHelperStatics.Uv2 + ";");
            }
            if (this.Setting.FragmentView) {
                this.Fragment.push("uniform   " + ShaderMaterialHelperStatics.uniformStandardType + ' ' + ShaderMaterialHelperStatics.uniformView + ";");
            }
            if (this.Setting.FragmentWorld) {
                this.Fragment.push("uniform   " + ShaderMaterialHelperStatics.uniformStandardType + ' ' + ShaderMaterialHelperStatics.uniformWorld + ";");
            }
            if (this.Setting.FragmentViewProjection) {
                this.Fragment.push("uniform   " + ShaderMaterialHelperStatics.uniformStandardType + ' ' + ShaderMaterialHelperStatics.uniformViewProjection + ";");
            }
            if (this.Setting.FragmentWorldView) {
                this.Fragment.push("uniform   " + ShaderMaterialHelperStatics.uniformStandardType + ' ' + ShaderMaterialHelperStatics.uniformWorldView + ";");
            }
            if (this.Setting.Flags) {
                this.Fragment.push("uniform  float " + ShaderMaterialHelperStatics.uniformFlags + ";");
            }
            if (this.FragmentUniforms) {
                this.Fragment.push(this.FragmentUniforms);
            }
            this.Fragment.push("varying vec3 " + ShaderMaterialHelperStatics.Position + ";");
            this.Fragment.push("varying vec3 " + ShaderMaterialHelperStatics.Normal + ";");
            if (this.Setting.WorldPosition) {
                this.Vertex.push("varying vec3 " + ShaderMaterialHelperStatics.WorldPosition + ";");
                this.Vertex.push("varying vec3 " + ShaderMaterialHelperStatics.WorldNormal + ";");
                this.Fragment.push("varying vec3 " + ShaderMaterialHelperStatics.WorldPosition + ";");
                this.Fragment.push("varying vec3 " + ShaderMaterialHelperStatics.WorldNormal + ";");
            }
            if (this.Setting.Texture2Ds != null) {
                for (var s in this.Setting.Texture2Ds) {
                    if (this.Setting.Texture2Ds[s].inVertex) {
                        this.Vertex.push("uniform  sampler2D " + ShaderMaterialHelperStatics.Texture2D + s + ";");
                    }
                    if (this.Setting.Texture2Ds[s].inFragment) {
                        this.Fragment.push("uniform  sampler2D  " + ShaderMaterialHelperStatics.Texture2D + s + ";");
                    }
                }
            }
            if (this.Setting.CameraShot) {
                this.Fragment.push("uniform  sampler2D  textureSampler;");
            }
            if (this.Setting.TextureCubes != null) {
                for (var s in this.Setting.TextureCubes) {
                    if (this.Setting.TextureCubes[s].inVertex) {
                        this.Vertex.push("uniform  samplerCube  " + ShaderMaterialHelperStatics.TextureCube + s + ";");
                    }
                    if (this.Setting.TextureCubes[s].inFragment) {
                        this.Fragment.push("uniform  samplerCube   " + ShaderMaterialHelperStatics.TextureCube + s + ";");
                    }
                }
            }
            if (this.Setting.Center) {
                this.Vertex.push("uniform  vec3 " + ShaderMaterialHelperStatics.Center + ";");
                this.Fragment.push("uniform  vec3 " + ShaderMaterialHelperStatics.Center + ";");
            }
            if (this.Setting.Mouse) {
                this.Vertex.push("uniform  vec2 " + ShaderMaterialHelperStatics.Mouse + ";");
                this.Fragment.push("uniform  vec2 " + ShaderMaterialHelperStatics.Mouse + ";");
            }
            if (this.Setting.Screen) {
                this.Vertex.push("uniform  vec2 " + ShaderMaterialHelperStatics.Screen + ";");
                this.Fragment.push("uniform  vec2 " + ShaderMaterialHelperStatics.Screen + ";");
            }
            if (this.Setting.Camera) {
                this.Vertex.push("uniform  vec3 " + ShaderMaterialHelperStatics.Camera + ";");
                this.Fragment.push("uniform  vec3 " + ShaderMaterialHelperStatics.Camera + ";");
            }
            if (this.Setting.Look) {
                this.Vertex.push("uniform  vec3 " + ShaderMaterialHelperStatics.Look + ";");
                this.Fragment.push("uniform  vec3 " + ShaderMaterialHelperStatics.Look + ";");
            }
            if (this.Setting.Time) {
                this.Vertex.push("uniform  float " + ShaderMaterialHelperStatics.Time + ";");
                this.Fragment.push("uniform  float " + ShaderMaterialHelperStatics.Time + ";");
            }
            if (this.Setting.GlobalTime) {
                this.Vertex.push("uniform  vec4 " + ShaderMaterialHelperStatics.GlobalTime + ";");
                this.Fragment.push("uniform  vec4 " + ShaderMaterialHelperStatics.GlobalTime + ";");
            }
            if (this.Setting.ReflectMatrix) {
                this.Vertex.push("uniform  mat4 " + ShaderMaterialHelperStatics.ReflectMatrix + ";");
                this.Fragment.push("uniform  mat4 " + ShaderMaterialHelperStatics.ReflectMatrix + ";");
            }
            if (this.Setting.Helpers) {
                var sresult = Shader.Join([
                    "vec3 random3(vec3 c) {   float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));   vec3 r;   r.z = fract(512.0*j); j *= .125;  r.x = fract(512.0*j); j *= .125; r.y = fract(512.0*j);  return r-0.5;  } ",
                    "float rand(vec2 co){   return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); } ",
                    "const float F3 =  0.3333333;const float G3 =  0.1666667;",
                    "float simplex3d(vec3 p) {   vec3 s = floor(p + dot(p, vec3(F3)));   vec3 x = p - s + dot(s, vec3(G3));  vec3 e = step(vec3(0.0), x - x.yzx);  vec3 i1 = e*(1.0 - e.zxy);  vec3 i2 = 1.0 - e.zxy*(1.0 - e);   vec3 x1 = x - i1 + G3;   vec3 x2 = x - i2 + 2.0*G3;   vec3 x3 = x - 1.0 + 3.0*G3;   vec4 w, d;    w.x = dot(x, x);   w.y = dot(x1, x1);  w.z = dot(x2, x2);  w.w = dot(x3, x3);   w = max(0.6 - w, 0.0);   d.x = dot(random3(s), x);   d.y = dot(random3(s + i1), x1);   d.z = dot(random3(s + i2), x2);  d.w = dot(random3(s + 1.0), x3);  w *= w;   w *= w;  d *= w;   return dot(d, vec4(52.0));     }  ",
                    "float noise(vec3 m) {  return   0.5333333*simplex3d(m)   +0.2666667*simplex3d(2.0*m) +0.1333333*simplex3d(4.0*m) +0.0666667*simplex3d(8.0*m);   } ",
                    "float dim(vec3 p1 , vec3 p2){   return sqrt((p2.x-p1.x)*(p2.x-p1.x)+(p2.y-p1.y)*(p2.y-p1.y)+(p2.z-p1.z)*(p2.z-p1.z)); }",
                    "vec2  rotate_xy(vec2 pr1,vec2  pr2,float alpha) {vec2 pp2 = vec2( pr2.x - pr1.x,   pr2.y - pr1.y );return  vec2( pr1.x + pp2.x * cos(alpha*3.14159265/180.) - pp2.y * sin(alpha*3.14159265/180.),pr1.y + pp2.x * sin(alpha*3.14159265/180.) + pp2.y * cos(alpha*3.14159265/180.));} \n vec3  r_y(vec3 n, float a,vec3 c) {vec3 c1 = vec3( c.x,  c.y,   c.z );c1.x = c1.x;c1.y = c1.z;vec2 p = rotate_xy(vec2(c1.x,c1.y), vec2( n.x,  n.z ), a);n.x = p.x;n.z = p.y;return n; } \n vec3  r_x(vec3 n, float a,vec3 c) {vec3 c1 = vec3( c.x,  c.y,   c.z );c1.x = c1.y;c1.y = c1.z;vec2 p = rotate_xy(vec2(c1.x,c1.y), vec2( n.y,  n.z ), a);n.y = p.x;n.z = p.y;return n; } \n vec3  r_z(vec3 n, float a,vec3 c) {  vec3 c1 = vec3( c.x,  c.y,   c.z );vec2 p = rotate_xy(vec2(c1.x,c1.y), vec2( n.x,  n.y ), a);n.x = p.x;n.y = p.y;return n; }",
                ]);
                this.Vertex.push(sresult);
                this.Fragment.push(sresult);
            }
	
		this.Fragment.push(this.VertexBeforeMain);           
            this.Vertex.push("void main(void) { \n\
    " + ShaderMaterialHelperStatics.Position + " = " + ShaderMaterialHelperStatics.AttrPosition + "; \n\
    " + ShaderMaterialHelperStatics.Normal + " = " + ShaderMaterialHelperStatics.AttrNormal + "; \n\
    vec4 result = vec4(" + ShaderMaterialHelperStatics.Position + ",1.);  \n\
     vec4 wresult = vec4(0.);  \n\
      vuv = uv;\n\
     #[Source]\n\
    if(wresult.x != 0.0 || wresult.y != 0. || wresult.z !=0.)\n\
			      gl_Position =wresult;\n\
    else gl_Position = worldViewProjection * result;\n\
    #[AfterFinishVertex] \n\
 }");
            // start Build Fragment Frame 
            if (this.Setting.NormalMap != null) {
                this.Fragment.push("vec3 normalMap() { vec4 result = vec4(0.); " + this.Setting.NormalMap + "; \n\
                  result = vec4( normalize( " + this.Setting.Normal + " -(normalize(result.xyz)*2.0-vec3(1.))*(max(-0.5,min(0.5," + Shader.Print(this.Setting.NormalOpacity) + ")) )),1.0); return result.xyz;}");
            }
            if (this.Setting.SpecularMap != null) {
                this.Fragment.push("float specularMap() { vec4 result = vec4(0.);float float_result = 0.; " + this.Setting.SpecularMap + "; return float_result ;}");
            }
            this.Fragment.push(this.FragmentBeforeMain);
            this.Fragment.push(" \n\
void main(void) { \n\
     int discardState = 0;\n\
     vec4 result = vec4(0.);\n\
     #[Source] \n\
     if(discardState == 0)gl_FragColor = result; \n\
}");
        };
        ShaderBuilder.prototype.PrepareBeforePostProcessBuild = function () {
            this.Setting = Shader.Me.Setting;
            this.Attributes.push(ShaderMaterialHelperStatics.AttrPosition);
            // start Build Vertex Frame 
            /*#extension GL_OES_standard_derivatives : enable*/
            this.Fragment.push("precision " + this.Setting.PrecisionMode + " float;\n\
\n\
 ");
            if (this.Setting.Uv) {
                this.Fragment.push("varying vec2 vUV;");
            }
            if (this.Setting.Flags) {
                this.Fragment.push("uniform  float " + ShaderMaterialHelperStatics.uniformFlags + ";");
            }
            if (this.Setting.Texture2Ds != null) {
                for (var s in this.Setting.Texture2Ds) {
                    if (this.Setting.Texture2Ds[s].inFragment) {
                        this.Fragment.push("uniform  sampler2D  " + ShaderMaterialHelperStatics.Texture2D + s + ";");
                    }
                }
            }
            if (this.PPSSamplers != null) {
                for (var s in this.PPSSamplers) {
                    if (this.PPSSamplers[s]) {
                        this.Fragment.push("uniform  sampler2D  " + this.PPSSamplers[s] + ";");
                    }
                }
            }
            if (this.Setting.CameraShot) {
                this.Fragment.push("uniform  sampler2D  textureSampler;");
            }
            if (this.Setting.Mouse) {
                this.Fragment.push("uniform  vec2 " + ShaderMaterialHelperStatics.Mouse + ";");
            }
            if (this.Setting.Screen) {
                this.Fragment.push("uniform  vec2 " + ShaderMaterialHelperStatics.Screen + ";");
            }
            if (this.Setting.Camera) {
                this.Fragment.push("uniform  vec3 " + ShaderMaterialHelperStatics.Camera + ";");
            }
            if (this.Setting.Look) {
                this.Fragment.push("uniform  vec3 " + ShaderMaterialHelperStatics.Look + ";");
            }
            if (this.Setting.Time) {
                this.Fragment.push("uniform  float " + ShaderMaterialHelperStatics.Time + ";");
            }
            if (this.Setting.GlobalTime) {
                this.Fragment.push("uniform  vec4 " + ShaderMaterialHelperStatics.GlobalTime + ";");
            }
            if (this.Setting.Helpers) {
                var sresult = Shader.Join([
                    "vec3 random3(vec3 c) {   float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));   vec3 r;   r.z = fract(512.0*j); j *= .125;  r.x = fract(512.0*j); j *= .125; r.y = fract(512.0*j);  return r-0.5;  } ",
                    "float rand(vec2 co){   return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); } ",
                    "const float F3 =  0.3333333;const float G3 =  0.1666667;",
                    "float simplex3d(vec3 p) {   vec3 s = floor(p + dot(p, vec3(F3)));   vec3 x = p - s + dot(s, vec3(G3));  vec3 e = step(vec3(0.0), x - x.yzx);  vec3 i1 = e*(1.0 - e.zxy);  vec3 i2 = 1.0 - e.zxy*(1.0 - e);   vec3 x1 = x - i1 + G3;   vec3 x2 = x - i2 + 2.0*G3;   vec3 x3 = x - 1.0 + 3.0*G3;   vec4 w, d;    w.x = dot(x, x);   w.y = dot(x1, x1);  w.z = dot(x2, x2);  w.w = dot(x3, x3);   w = max(0.6 - w, 0.0);   d.x = dot(random3(s), x);   d.y = dot(random3(s + i1), x1);   d.z = dot(random3(s + i2), x2);  d.w = dot(random3(s + 1.0), x3);  w *= w;   w *= w;  d *= w;   return dot(d, vec4(52.0));     }  ",
                    "float noise(vec3 m) {  return   0.5333333*simplex3d(m)   +0.2666667*simplex3d(2.0*m) +0.1333333*simplex3d(4.0*m) +0.0666667*simplex3d(8.0*m);   } ",
                    "vec2  rotate_xy(vec2 pr1,vec2  pr2,float alpha) {vec2 pp2 = vec2( pr2.x - pr1.x,   pr2.y - pr1.y );return  vec2( pr1.x + pp2.x * cos(alpha*3.14159265/180.) - pp2.y * sin(alpha*3.14159265/180.),pr1.y + pp2.x * sin(alpha*3.14159265/180.) + pp2.y * cos(alpha*3.14159265/180.));} \n vec3  r_y(vec3 n, float a,vec3 c) {vec3 c1 = vec3( c.x,  c.y,   c.z );c1.x = c1.x;c1.y = c1.z;vec2 p = rotate_xy(vec2(c1.x,c1.y), vec2( n.x,  n.z ), a);n.x = p.x;n.z = p.y;return n; } \n vec3  r_x(vec3 n, float a,vec3 c) {vec3 c1 = vec3( c.x,  c.y,   c.z );c1.x = c1.y;c1.y = c1.z;vec2 p = rotate_xy(vec2(c1.x,c1.y), vec2( n.y,  n.z ), a);n.y = p.x;n.z = p.y;return n; } \n vec3  r_z(vec3 n, float a,vec3 c) {  vec3 c1 = vec3( c.x,  c.y,   c.z );vec2 p = rotate_xy(vec2(c1.x,c1.y), vec2( n.x,  n.y ), a);n.x = p.x;n.y = p.y;return n; }",
                    "float getIdColor(vec4 a){    float b = 255.;float c = 255. / b;float x = floor(a.x*256. / c);float y = floor(a.y *256./ c);float z = floor(a.z*256. / c);return z * b * b + y * b + x;}"
                    //"vec3 sundir(float da,float db,vec3 ps){ float h = floor(floor(" + ShaderMaterialHelperStatics.GlobalTime + ".y/100.)/100.);float m =     floor(" + ShaderMaterialHelperStatics.GlobalTime + ".y/100.) - h*100.;float s =      " + ShaderMaterialHelperStatics.GlobalTime + ".y  - h*10000. -m*100.;float si = s *100./60.;float mi = m*100./60.;float hi = h+mi/100.+si/10000.;float dm = 180./(db-da); vec3  gp = vec3(ps.x,ps.y,ps.z);gp = r_z(gp,  dm* hi -da*dm -90. ,vec3(0.));gp = r_x(gp,40. ,vec3(0.)); gp.x = gp.x*-1.; gp.z = gp.z*-1.; return gp; }",
                ]);
                this.Fragment.push(sresult);
            }
            if (this.Setting.NormalMap != null) {
                this.Fragment.push("vec3 normalMap() { vec4 result = vec4(0.);   return result.xyz;}");
            }
            // start Build Fragment Frame  
            this.Fragment.push(this.FragmentBeforeMain);
            this.Fragment.push(" \n\
void main(void) { \n\
     int discardState = 0;\n\
     vec2 vuv = vUV;\n\
     vec3 center = vec3(0.);\n\
     vec4 result = vec4(0.);\n\
     #[Source] \n\
     if(discardState == 0)gl_FragColor = result; \n\
}");
        };
        ShaderBuilder.prototype.PrepareMaterial = function (material, scene) {
            material.ShaderSetting =
                this.Setting;
            if (!this.Setting.Transparency) {
                material.needAlphaBlending = function () { return false; };
            }
            else {
                material.needAlphaBlending = function () { return true; };
            }           
            if (!this.Setting.Back)
                this.Setting.Back = false;
            if (this.Setting.DisableAlphaTesting) {
                material.needAlphaTesting = function () { return false; };
            }
            else {
                material.needAlphaTesting = function () { return true; };
            }            
            material.setVector3("camera", { x: 18., y: 18., z: 18. });
            material.backFaceCulling = !this.Setting.Back;
            material.wireframe = this.Setting.Wire;
            material.setFlags = function (flags) {
                if (this.ShaderSetting.Flags) {
                    var s = 0.;
                    for (var i = 0; i < 20; i++) {
                        if (flags.length > i && flags[i] == '1')
                            s += Math.pow(2., i);
                    }
                    this.flagNumber = s;
                    this.setFloat(ShaderMaterialHelperStatics.uniformFlags, s);
                }
            };
            material.flagNumber = 0.;
            material.flagUp = function (flag) {
                if (this.ShaderSetting.Flags) {
                    if (Math.floor((this.flagNumber / Math.pow(2., flag) % 2.)) != 1.)
                        this.flagNumber += Math.pow(2., flag);
                    this.setFloat(ShaderMaterialHelperStatics.uniformFlags, this.flagNumber);
                }
            };
            material.flagDown = function (flag) {
                if (this.ShaderSetting.Flags) {
                    if (Math.floor((this.flagNumber / Math.pow(2., flag) % 2.)) == 1.)
                        this.flagNumber -= Math.pow(2., flag);
                    this.setFloat(ShaderMaterialHelperStatics.uniformFlags, this.flagNumber);
                }
            };
            material.onCompiled = function () {
            };
            if (this.Setting.Texture2Ds != null) {
                for (var s in this.Setting.Texture2Ds) {
                    // setTexture2D
                    var texture = new ShaderMaterialHelper().DefineTexture(this.Setting.Texture2Ds[s].key, scene);
                    material.setTexture(ShaderMaterialHelperStatics.Texture2D + s, texture);
                }
            }
            if (this.Setting.TextureCubes != null) {
                for (var s in this.Setting.TextureCubes) {
                    // setTexture2D
                    var texture = new ShaderMaterialHelper().DefineCubeTexture(this.Setting.TextureCubes[s].key, scene);
                    material.setTexture(ShaderMaterialHelperStatics.TextureCube + s, texture);
                    material.setMatrix(ShaderMaterialHelperStatics.ReflectMatrix, texture.getReflectionTextureMatrix());
                }
            }
            Shader.Me = null;
            return material;
        };
        ShaderBuilder.prototype.Build = function () {
            Shader.Me.Parent.Setting = Shader.Me.Setting;
            Shader.Me = Shader.Me.Parent;
            return this.Body;
        };
        ShaderBuilder.prototype.BuildVertex = function () {
            Shader.Me.Parent.Setting = Shader.Me.Setting;
            Shader.Me = Shader.Me.Parent;
            return this.VertexBody;
        };
        ShaderBuilder.prototype.SetUniform = function (name, type) {
            if (!Shader.Me.VertexUniforms)
                Shader.Me.VertexUniforms = "";
            if (!Shader.Me.FragmentUniforms)
                Shader.Me.FragmentUniforms = "";
            this.VertexUniforms += 'uniform ' + type + ' ' + name + ';\n\
            ';
            this.FragmentUniforms += 'uniform ' + type + ' ' + name + ';\n\
            ';
            return this;
        };
        ShaderBuilder.prototype.BuildMaterial = function (scene) {
            this.PrepareBeforeMaterialBuild();
            if (Shader.ShaderIdentity == null)
                Shader.ShaderIdentity = 0;
            Shader.ShaderIdentity++;
            var shaderMaterial = new ShaderMaterialHelper().ShaderMaterial("ShaderBuilder_" + Shader.ShaderIdentity, scene, {
                Pixel: Shader.Join(this.Fragment)
                    .replace("#[Source]", this.Body),
                Vertex: Shader.Join(this.Vertex)
                    .replace("#[Source]", Shader.Def(this.VertexBody, ""))
                    .replace("#[AfterFinishVertex]", Shader.Def(this.AfterVertex, ""))
            }, {
                uniforms: this.Uniforms,
                attributes: this.Attributes
            });
            Shader.Indexer = 1;
            return this.PrepareMaterial(shaderMaterial, scene);
        };
        ShaderBuilder.prototype.BuildPostProcess = function (camera, scene, scale, option) {
            this.Setting.Screen = true;
            this.Setting.Mouse = true;
            this.Setting.Time = true;
            this.Setting.CameraShot = true;
            this.PrepareBeforePostProcessBuild();
            if (Shader.ShaderIdentity == null)
                Shader.ShaderIdentity = 0;
            Shader.ShaderIdentity++;
            var samplers = [];
            for (var s in this.Setting.Texture2Ds) {
                samplers.push(ShaderMaterialHelperStatics.Texture2D + s);
            }
            if (this.PPSSamplers != null) {
                for (var s in this.PPSSamplers) {
                    if (this.PPSSamplers[s]) {
                        samplers.push(this.PPSSamplers[s]);
                    }
                }
            }
            var shaderPps = new ShaderMaterialHelper().ShaderPostProcess("ShaderBuilder_" + Shader.ShaderIdentity, samplers, camera, scale, {
                Pixel: Shader.Join(this.Fragment)
                    .replace("#[Source]", this.Body),
                Vertex: Shader.Join(this.Vertex)
                    .replace("#[Source]", Shader.Def(this.VertexBody, ""))
                    .replace("#[AfterFinishVertex]", Shader.Def(this.AfterVertex, ""))
            }, {
                uniforms: this.Uniforms,
                attributes: this.Attributes
            }, option);
            if (this.Setting.Texture2Ds != null) {
                for (var s in this.Setting.Texture2Ds) {
                    // setTexture2D
                    var texture = new ShaderMaterialHelper().DefineTexture(this.Setting.Texture2Ds[s].key, scene);
                    new ShaderMaterialHelper().PostProcessTextures(shaderPps, ShaderMaterialHelperStatics.Texture2D + s, texture);
                }
            }
            return shaderPps;
        };
        ShaderBuilder.prototype.Event = function (index, mat) {
            Shader.Me.Setting.Flags = true;
            Shader.Indexer++;
            this.Body = Shader.Def(this.Body, "");
            this.Body += "  if ( floor(mod( " + ShaderMaterialHelperStatics.uniformFlags + "/pow(2.," + Shader.Print(index) + "),2.)) == 1.) { " + mat + " } ";
            return this;
        };
        ShaderBuilder.prototype.EventVertex = function (index, mat) {
            Shader.Me.Setting.Flags = true;
            Shader.Me.Setting.Vertex = true;
            Shader.Indexer++;
            this.VertexBody = Shader.Def(this.VertexBody, "");
            this.VertexBody += " if( floor(mod( " + ShaderMaterialHelperStatics.uniformFlags + "/pow(2.," + Shader.Print(index) + "),2.)) == 1. ){ " + mat + "}";
            return this;
        };
        ShaderBuilder.prototype.Transparency = function () {
            Shader.Me.Setting.Transparency = true;
            return this;
        };
        ShaderBuilder.prototype.DisableAlphaTesting = function () {
            Shader.Me.Setting.DisableAlphaTesting = true;
            return this;
        };
        ShaderBuilder.prototype.PostEffect1 = function (id, effect) {
            if (Shader.Me.PostEffect1Effects == null)
                Shader.Me.PostEffect1Effects = [];
            Shader.Me.PostEffect1[id] = effect;
            return this;
        };
        ShaderBuilder.prototype.PostEffect2 = function (id, effect) {
            if (Shader.Me.PostEffect2Effects == null)
                Shader.Me.PostEffect2Effects = [];
            Shader.Me.PostEffect2[id] = effect;
            return this;
        };
        ShaderBuilder.prototype.ImportSamplers = function (txts) {
            if (Shader.Me.PPSSamplers == null)
                Shader.Me.PPSSamplers = [];
            for (var s in txts) {
                Shader.Me.PPSSamplers.push(txts[s]);
            }
            return this;
        };
        ShaderBuilder.prototype.Wired = function () {
            Shader.Me.Setting.Wire = true;
            return this;
        };
        ShaderBuilder.prototype.VertexShader = function (mat) {
            this.VertexBody = Shader.Def(this.VertexBody, "");
            this.VertexBody += mat;
            return this;
        };
        ShaderBuilder.prototype.Solid = function (color) {
            color = Shader.Def(color, { r: 0., g: 0., b: 0., a: 1. });
            color.a = Shader.Def(color.a, 1.);
            color.r = Shader.Def(color.r, 0.);
            color.g = Shader.Def(color.g, 0.);
            color.b = Shader.Def(color.b, 0.);
            this.Body = Shader.Def(this.Body, "");
            this.Body += " result = vec4(" + Shader.Print(color.r) + "," + Shader.Print(color.g) + "," + Shader.Print(color.b) + "," + Shader.Print(color.a) + ");";
            return this;
        };
        ShaderBuilder.prototype.GetMapIndex = function (key) {
            if (Shader.Me.Setting.Texture2Ds != null) {
                for (var it in Shader.Me.Setting.Texture2Ds) {
                    if (this.Setting.Texture2Ds[it].key == key) {
                        return it;
                    }
                }
            }
            else
                Shader.Me.Setting.Texture2Ds = [];
            return -1;
        };
        ShaderBuilder.prototype.GetCubeMapIndex = function (key) {
            if (Shader.Me.Setting.TextureCubes != null) {
                for (var it in Shader.Me.Setting.TextureCubes) {
                    if (this.Setting.TextureCubes[it].key == key) {
                        return it;
                    }
                }
            }
            else
                Shader.Me.Setting.TextureCubes = [];
            return -1;
        };
        ShaderBuilder.prototype.Func = function (fun) {
            return fun(Shader.Me);
        };
        ShaderBuilder.prototype.Nut = function (value, option) {
            Shader.Indexer++;
            option = Shader.Def(option, {});
            option.frame = Shader.Def(option.frame, 'sin(time*0.4)');
            var sresult = Shader.Join([
                "float nut#[Ind]= " + Shader.Print(value) + ";",
                "float nut_ts#[Ind] = " + Shader.Print(option.frame) + ";",
                this.Func(function (me) {
                    var f = [];
                    for (var i = 0; i < option.bones.length; i++) {
                        f.push('vec3 nut_p#[Ind]_' + i + ' = ' + option.bones[i].center + ';');
                    }
                    return Shader.Join(f);
                }),
                this.Func(function (me) {
                    var f = [];
                    for (var i = 0; i < option.bones.length; i++) {
                        f.push('if(nut#[Ind] ' + option.bones[i].bet + '){ ');
                        for (var j = 0; j < option.array.length; j++) {
                            if (option.bones[i].rotation.x != null && option.bones[i].rotation.x != undefined) {
                                f.push(option.array[j] + ' = r_x(' + option.array[j] +
                                    ',nut_ts#[Ind]*' + Shader.Print(option.bones[i].rotation.x)
                                    + ',nut_p#[Ind]_' + i + ');');
                                for (var v = i + 1; v < option.bones.length; v++) {
                                    f.push('nut_p#[Ind]_' + v + ' = r_x(nut_p#[Ind]_' + v +
                                        ',nut_ts#[Ind]*' + Shader.Print(option.bones[i].rotation.x)
                                        + ',nut_p#[Ind]_' + i + ');');
                                }
                            }
                            if (option.bones[i].rotation.y != null && option.bones[i].rotation.y != undefined) {
                                f.push(option.array[j] + ' = r_y(' + option.array[j] + ',nut_ts#[Ind]*' + Shader.Print(option.bones[i].rotation.y)
                                    + ',nut_p#[Ind]_' + i + ');');
                                for (var v = i + 1; v < option.bones.length; v++) {
                                    f.push('nut_p#[Ind]_' + v + ' = r_y(nut_p#[Ind]_' + v + ',nut_ts#[Ind]*' + Shader.Print(option.bones[i].rotation.y)
                                        + ',nut_p#[Ind]_' + i + ');');
                                }
                            }
                            if (option.bones[i].rotation.z != null && option.bones[i].rotation.z != undefined) {
                                f.push(option.array[j] + ' = r_z(' + option.array[j] + ',nut_ts#[Ind]*' + Shader.Print(option.bones[i].rotation.z)
                                    + ',nut_p#[Ind]_' + i + ');');
                                for (var v = i + 1; v < option.bones.length; v++) {
                                    f.push('nut_p#[Ind]_' + v + ' = r_z(nut_p#[Ind]_' + v + ',nut_ts#[Ind]*' + Shader.Print(option.bones[i].rotation.z)
                                        + ',nut_p#[Ind]_' + i + ');');
                                }
                            }
                        }
                        f.push('}');
                    }
                    return Shader.Join(f);
                })
            ]);
            this.VertexBody = Shader.Def(this.VertexBody, "");
            sresult = Shader.Replace(sresult, '#[Ind]', Shader.Indexer.toString()) + " result = vec4(pos,1.);";
            this.VertexBody += sresult;
            return this;
        };
        ShaderBuilder.prototype.Map = function (option) {
            Shader.Indexer++;
            option = Shader.Def(option, { path: '/images/color.png' });
            var s = 0.;
            var refInd = '';
            if (option.index == null || option.index == undefined) {
                s = Shader.Me.GetMapIndex(option.path);
                if (s == -1) {
                    Shader.Me.Setting.Texture2Ds.push({ key: option.path, inVertex: option.useInVertex, inFragment: true });
                }
                else {
                    Shader.Me.Setting.Texture2Ds[s].inVertex = option.useInVertex;
                }
                s = Shader.Me.GetMapIndex(option.path);
                refInd = ShaderMaterialHelperStatics.Texture2D + s;
            }
            else if (option.index == "current") {
                refInd = "textureSampler"; // used Only for postProcess
            }
            else {
                var sn = Shader.Replace(option.index.toString(), '-', '0');
                var reg = new RegExp('^\\d+$');
                if (reg.test(sn) && option.index.toString().indexOf('.') == -1)
                    refInd = ShaderMaterialHelperStatics.Texture2D + option.index;
                else {
                    refInd = option.index;
                }
            }
            Shader.Me.Setting.Center = true;
            Shader.Me.Setting.Helpers = true;
            Shader.Me.Setting.Uv = true;
            option.normal = Shader.Def(option.normal, Normals.Map);
            option.alpha = Shader.Def(option.alpha, false);
            option.bias = Shader.Def(option.bias, "0.");
            option.normalLevel = Shader.Def(option.normalLevel, 1.0);
            option.path = Shader.Def(option.path, "qa.jpg");
            option.rotation = Shader.Def(option.rotation, { x: 0, y: 0, z: 0 });
            option.scaleX = Shader.Def(option.scaleX, 1.);
            option.scaleY = Shader.Def(option.scaleY, 1.);
            option.useInVertex = Shader.Def(option.useInVertex, false);
            option.x = Shader.Def(option.x, 0.0);
            option.y = Shader.Def(option.y, 0.0);
            option.uv = Shader.Def(option.uv, ShaderMaterialHelperStatics.Uv);
            option.animation = Shader.Def(option.animation, false);
            option.tiled = Shader.Def(option.tiled, false);
            option.columnIndex = Shader.Def(option.columnIndex, 1);
            option.rowIndex = Shader.Def(option.rowIndex, 1);
            option.animationSpeed = Shader.Def(option.animationSpeed, 2000);
            option.animationFrameEnd = Shader.Def(option.animationFrameEnd, 100) + option.indexCount;
            option.animationFrameStart = Shader.Def(option.animationFrameStart, 0) + option.indexCount;
            option.indexCount = Shader.Def(option.indexCount, 1);
            var frameLength = Math.min(option.animationFrameEnd - option.animationFrameStart, option.indexCount * option.indexCount);
            var uv = Shader.Def(option.uv, ShaderMaterialHelperStatics.Uv);
            if (option.uv == "planar") {
                uv = ShaderMaterialHelperStatics.Position;
            }
            else {
                uv = 'vec3(' + option.uv + '.x,' + option.uv + '.y,0.)';
            }
            option.scaleX /= option.indexCount;
            option.scaleY /= option.indexCount;
            var rotate = ["vec3 centeri#[Ind] = " + ShaderMaterialHelperStatics.Center + ";",
                "vec3 ppo#[Ind] = r_z( " + uv + "," + Shader.Print(option.rotation.x) + ",centeri#[Ind]);  ",
                " ppo#[Ind] = r_y( ppo#[Ind]," + Shader.Print(option.rotation.y) + ",centeri#[Ind]);  ",
                " ppo#[Ind] = r_x( ppo#[Ind]," + Shader.Print(option.rotation.x) + ",centeri#[Ind]); ",
                "vec3 nrm#[Ind] = r_z( " + option.normal + "," + Shader.Print(option.rotation.x) + ",centeri#[Ind]);  ",
                " nrm#[Ind] = r_y( nrm#[Ind]," + Shader.Print(option.rotation.y) + ",centeri#[Ind]);  ",
                " nrm#[Ind] = r_x( nrm#[Ind]," + Shader.Print(option.rotation.z) + ",centeri#[Ind]);  "].join("\n\
");
            var sresult = Shader.Join([rotate,
                " vec4 color#[Ind] = texture2D(" +
                    refInd + " ,ppo#[Ind].xy*vec2(" +
                    Shader.Print(option.scaleX) + "," + Shader.Print(option.scaleY) + ")+vec2(" +
                    Shader.Print(option.x) + "," + Shader.Print(option.y) + ")" + (option.bias == null || Shader.Print(option.bias) == '0.' ? "" : "," + Shader.Print(option.bias)) + ");",
                " if(nrm#[Ind].z < " + Shader.Print(option.normalLevel) + "){ ",
                (option.alpha ? " result =  color#[Ind];" : "result = vec4(color#[Ind].rgb , 1.); "),
                "}"]);
            if (option.indexCount > 1 || option.tiled) {
                option.columnIndex = option.indexCount - option.columnIndex + 1.0;
                sresult = [
                    " vec3 uvt#[Ind] = vec3(" + uv + ".x*" + Shader.Print(option.scaleX) + "+" + Shader.Print(option.x) + "," + uv + ".y*" + Shader.Print(option.scaleY) + "+" + Shader.Print(option.y) + ",0.0);     ",
                    "             ",
                    " float xst#[Ind] = 1./(" + Shader.Print(option.indexCount) + "*2.);                                                    ",
                    " float yst#[Ind] =1./(" + Shader.Print(option.indexCount) + "*2.);                                                     ",
                    " float xs#[Ind] = 1./" + Shader.Print(option.indexCount) + ";                                                     ",
                    " float ys#[Ind] = 1./" + Shader.Print(option.indexCount) + ";                                                     ",
                    " float yid#[Ind] = " + Shader.Print(option.columnIndex - 1.0) + " ;                                                      ",
                    " float xid#[Ind] =  " + Shader.Print(option.rowIndex - 1.0) + ";                                                      ",
                    option.animation ? " float ind_a#[Ind] = floor(mod(time*0.001*" + Shader.Print(option.animationSpeed) + ",   " + Shader.Print(frameLength) + " )+" + Shader.Print(option.animationFrameStart) + ");" +
                        " yid#[Ind] = " + Shader.Print(option.indexCount) + "- floor(ind_a#[Ind] /  " + Shader.Print(option.indexCount) + ");" +
                        " xid#[Ind] =  floor(mod(ind_a#[Ind] ,  " + Shader.Print(option.indexCount) + ")); "
                        : "",
                    " float xi#[Ind] = mod(uvt#[Ind].x ,xs#[Ind])+xs#[Ind]*xid#[Ind]  ;                                   ",
                    " float yi#[Ind] = mod(uvt#[Ind].y ,ys#[Ind])+ys#[Ind]*yid#[Ind]  ;                                   ",
                    "                                                                       ",
                    " float xi2#[Ind] = mod(uvt#[Ind].x -xs#[Ind]*0.5 ,xs#[Ind])+xs#[Ind]*xid#[Ind]      ;                     ",
                    " float yi2#[Ind] = mod(uvt#[Ind].y -ys#[Ind]*0.5,ys#[Ind])+ys#[Ind]*yid#[Ind]   ;                         ",
                    "                                                                       ",
                    "                                                                       ",
                    " vec4 f#[Ind] = texture2D(" + refInd + ",vec2(xi#[Ind],yi#[Ind])) ;                             ",
                    " result =   f#[Ind] ;                                               ",
                    (option.tiled ? [" vec4 f2#[Ind] = texture2D(" + refInd + ",vec2(xi2#[Ind]+xid#[Ind] ,yi#[Ind])) ;                      ",
                        " vec4 f3#[Ind] = texture2D(" + refInd + ",vec2(xi#[Ind],yi2#[Ind]+yid#[Ind])) ;                       ",
                        " vec4 f4#[Ind] = texture2D(" + refInd + ",vec2(xi2#[Ind]+xid#[Ind],yi2#[Ind]+yid#[Ind])) ;                  ",
                        "                                                                       ",
                        "                                                                       ",
                        " float ir#[Ind]  = 0.,ir2#[Ind] = 0.;                                              ",
                        "                                                                       ",
                        "     if( yi2#[Ind]  >= yid#[Ind] *ys#[Ind] ){                                            ",
                        "         ir2#[Ind]  = min(2.,max(0.,( yi2#[Ind]-yid#[Ind] *ys#[Ind])*2.0/ys#[Ind] ))   ;             ",
                        "         if(ir2#[Ind] > 1.0) ir2#[Ind] =1.0-(ir2#[Ind]-1.0);                             ",
                        "         ir2#[Ind] = min(1.0,max(0.0,pow(ir2#[Ind]," + Shader.Print(15.) + " )*" + Shader.Print(3.) + ")); ",
                        "         result =  result *(1.0-ir2#[Ind]) +f3#[Ind]*ir2#[Ind]  ;           ",
                        "     }                                                                 ",
                        " if( xi2#[Ind]  >= xid#[Ind] *xs#[Ind]   ){                                               ",
                        "         ir2#[Ind]  = min(2.,max(0.,( xi2#[Ind]-xid#[Ind] *xs#[Ind])*2.0/xs#[Ind] ))   ;             ",
                        "         if(ir2#[Ind] > 1.0) ir2#[Ind] =1.0-(ir2#[Ind]-1.0);                             ",
                        "         ir2#[Ind] = min(1.0,max(0.0,pow(ir2#[Ind]," + Shader.Print(15.) + " )*" + Shader.Print(3.) + ")); ",
                        "         result = result *(1.0-ir2#[Ind]) +f2#[Ind]*ir2#[Ind]  ;           ",
                        "     }  ",
                        " if( xi2#[Ind]  >= xid#[Ind] *xs#[Ind]  && xi2#[Ind]  >= xid#[Ind] *xs#[Ind]  ){                                               ",
                        "         ir2#[Ind]  = min(2.,max(0.,( xi2#[Ind]-xid#[Ind] *xs#[Ind])*2.0/xs#[Ind] ))   ;             ",
                        "  float       ir3#[Ind]  = min(2.,max(0.,( yi2#[Ind]-yid#[Ind] *ys#[Ind])*2.0/ys#[Ind] ))   ;             ",
                        "         if(ir2#[Ind] > 1.0) ir2#[Ind] =1.0-(ir2#[Ind]-1.0);                             ",
                        "         if(ir3#[Ind] > 1.0) ir3#[Ind] =1.0-(ir3#[Ind]-1.0);                             ",
                        "         ir2#[Ind] = min(1.0,max(0.0,pow(ir2#[Ind]," + Shader.Print(15.) + " )*" + Shader.Print(3.) + ")); ",
                        "         ir3#[Ind] = min(1.0,max(0.0,pow(ir3#[Ind]," + Shader.Print(15.) + " )*" + Shader.Print(3.) + ")); ",
                        "         ir2#[Ind] = min(1.0,max(0.0, ir2#[Ind]* ir3#[Ind] )); ",
                        " if(nrm#[Ind].z < " + Shader.Print(option.normalLevel) + "){ ",
                        (option.alpha ? "    result =  result *(1.0-ir2#[Ind]) +f4#[Ind]* ir2#[Ind]   ;" : "    result = vec4(result.xyz*(1.0-ir2#[Ind]) +f4#[Ind].xyz* ir2#[Ind]   ,1.0); "),
                        "}",
                        "     }  "
                    ].join("\n") : "")
                ].join("\n");
            }
            sresult = Shader.Replace(sresult, '#[Ind]', "_" + Shader.Indexer + "_");
            this.Body = Shader.Def(this.Body, "");
            this.Body += sresult;
            return this;
        };
        ShaderBuilder.prototype.Multi = function (mats, combine) {
            combine = Shader.Def(combine, true);
            Shader.Indexer++;
            var pre = "", ps = ["", "", "", ""], psh = "0.0";
            for (var i = 0; i < mats.length; i++) {
                if (mats[i].result == undefined || mats[i].result == null)
                    mats[i] = { result: mats[i], opacity: 1.0 };
                pre += " vec4 result#[Ind]" + i + ";result#[Ind]" + i + " = vec4(0.,0.,0.,0.); float rp#[Ind]" + i + " = " + Shader.Print(mats[i].opacity) + "; \n\
";
                pre += mats[i].result + "\n\
                ";
                pre += " result#[Ind]" + i + " = result; \n\
";
                ps[0] += (i == 0 ? "" : " + ") + "result#[Ind]" + i + ".x*rp#[Ind]" + i;
                ps[1] += (i == 0 ? "" : " + ") + "result#[Ind]" + i + ".y*rp#[Ind]" + i;
                ps[2] += (i == 0 ? "" : " + ") + "result#[Ind]" + i + ".z*rp#[Ind]" + i;
                ps[3] += (i == 0 ? "" : " + ") + "result#[Ind]" + i + ".w*rp#[Ind]" + i;
                psh += "+" + Shader.Print(mats[i].opacity);
            }
            if (combine) {
                ps[0] = "(" + ps[0] + ")/(" + Shader.Print(psh) + ")";
                ps[1] = "(" + ps[1] + ")/(" + Shader.Print(psh) + ")";
                ps[2] = "(" + ps[2] + ")/(" + Shader.Print(psh) + ")";
                ps[3] = "(" + ps[3] + ")/(" + Shader.Print(psh) + ")";
            }
            pre += "result = vec4(" + ps[0] + "," + ps[1] + "," + ps[2] + "," + ps[3] + ");";
            this.Body = Shader.Def(this.Body, "");
            this.Body += Shader.Replace(pre, "#[Ind]", "_" + Shader.Indexer + "_");
            return this;
        };
        ShaderBuilder.prototype.Back = function (mat) {
            Shader.Me.Setting.Back = true;
            mat = Shader.Def(mat, '');
            this.Body = Shader.Def(this.Body, "");
            this.Body += 'if(' + ShaderMaterialHelperStatics.face_back + '){' + mat + ';}';
            return this;
        };
        ShaderBuilder.prototype.InLine = function (mat) {
            mat = Shader.Def(mat, '');
            this.Body = Shader.Def(this.Body, "");
            this.Body += mat;
            return this;
        };
        ShaderBuilder.prototype.Front = function (mat) {
            mat = Shader.Def(mat, '');
            this.Body = Shader.Def(this.Body, "");
            this.Body += 'if(' + ShaderMaterialHelperStatics.face_front + '){' + mat + ';}';
            return this;
        };
        ShaderBuilder.prototype.Range = function (mat1, mat2, option) {
            Shader.Indexer++;
            var k = Shader.Indexer;
            option.start = Shader.Def(option.start, 0.);
            option.end = Shader.Def(option.end, 1.);
            option.direction = Shader.Def(option.direction, ShaderMaterialHelperStatics.Position + '.y');
            var sresult = [
                "float s_r_dim#[Ind] = " + option.direction + ";",
                "if(s_r_dim#[Ind] > " + Shader.Print(option.end) + "){",
                mat2,
                "}",
                "else { ",
                mat1,
                "   vec4 mat1#[Ind]; mat1#[Ind]  = result;",
                "   if(s_r_dim#[Ind] > " + Shader.Print(option.start) + "){ ",
                mat2,
                "       vec4 mati2#[Ind];mati2#[Ind] = result;",
                "       float s_r_cp#[Ind]  = (s_r_dim#[Ind] - (" + Shader.Print(option.start) + "))/(" + Shader.Print(option.end) + "-(" + Shader.Print(option.start) + "));",
                "       float s_r_c#[Ind]  = 1.0 - s_r_cp#[Ind];",
                "       result = vec4(mat1#[Ind].x*s_r_c#[Ind]+mati2#[Ind].x*s_r_cp#[Ind],mat1#[Ind].y*s_r_c#[Ind]+mati2#[Ind].y*s_r_cp#[Ind],mat1#[Ind].z*s_r_c#[Ind]+mati2#[Ind].z*s_r_cp#[Ind],mat1#[Ind].w*s_r_c#[Ind]+mati2#[Ind].w*s_r_cp#[Ind]);",
                "   }",
                "   else { result = mat1#[Ind]; }",
                "}"
            ].join('\n\
');
            sresult = Shader.Replace(sresult, '#[Ind]', "_" + Shader.Indexer + "_");
            this.Body = Shader.Def(this.Body, "");
            this.Body += sresult;
            return this;
        };
        ShaderBuilder.prototype.Reference = function (index, mat) {
            if (Shader.Me.References == null)
                Shader.Me.References = "";
            var sresult = "vec4 resHelp#[Ind] = result;";
            if (Shader.Me.References.indexOf("," + index + ",") == -1) {
                Shader.Me.References += "," + index + ",";
                sresult += " vec4 result_" + index + " = vec4(0.);\n\
                ";
            }
            if (mat == null) {
                sresult += "  result_" + index + " = result;";
            }
            else {
                sresult += mat + "\n\
                 result_" + index + " = result;";
            }
            sresult += "result = resHelp#[Ind] ;";
            sresult = Shader.Replace(sresult, '#[Ind]', "_" + Shader.Indexer + "_");
            this.Body = Shader.Def(this.Body, "");
            this.Body += sresult;
            return this;
        };
        ShaderBuilder.prototype.ReplaceColor = function (index, color, mat, option) {
            Shader.Indexer++;
            option = Shader.Def(option, {});
            var d = Shader.Def(option.rangeStep, -0.280);
            var d2 = Shader.Def(option.rangePower, 0.0);
            var d3 = Shader.Def(option.colorIndex, 0.0);
            var d4 = Shader.Def(option.colorStep, 1.0);
            var ilg = Shader.Def(option.indexToEnd, false);
            var lg = " > 0.5 + " + Shader.Print(d) + " ";
            var lw = " < 0.5 - " + Shader.Print(d) + " ";
            var rr = "((result_" + index + ".x*" + Shader.Print(d4) + "-" + Shader.Print(d3) + ")>1.0 ? 0. : max(0.,(result_" + index + ".x*" + Shader.Print(d4) + "-" + Shader.Print(d3) + ")))";
            var rg = "((result_" + index + ".y*" + Shader.Print(d4) + "-" + Shader.Print(d3) + ")>1.0 ? 0. : max(0.,(result_" + index + ".y*" + Shader.Print(d4) + "-" + Shader.Print(d3) + ")))";
            var rb = "((result_" + index + ".z*" + Shader.Print(d4) + "-" + Shader.Print(d3) + ")>1.0 ? 0. : max(0.,(result_" + index + ".z*" + Shader.Print(d4) + "-" + Shader.Print(d3) + ")))";
            if (ilg) {
                rr = "min(1.0, max(0.,(result_" + index + ".x*" + Shader.Print(d4) + "-" + Shader.Print(d3) + ")))";
                rg = "min(1.0, max(0.,(result_" + index + ".y*" + Shader.Print(d4) + "-" + Shader.Print(d3) + ")))";
                rb = "min(1.0, max(0.,(result_" + index + ".z*" + Shader.Print(d4) + "-" + Shader.Print(d3) + ")))";
            }
            var a = " && ";
            var p = " + ";
            var r = "";
            var cond = "";
            switch (color) {
                case Helper.White:
                    cond = rr + lg + a + rg + lg + a + rb + lg;
                    r = "(" + rr + p + rg + p + rb + ")/3.0";
                    break;
                case Helper.Cyan:
                    cond = rr + lw + a + rg + lg + a + rb + lg;
                    r = "(" + rg + p + rb + ")/2.0 - (" + rr + ")/1.0";
                    break;
                case Helper.Pink:
                    cond = rr + lg + a + rg + lw + a + rb + lg;
                    r = "(" + rr + p + rb + ")/2.0 - (" + rg + ")/1.0";
                    break;
                case Helper.Yellow:
                    cond = rr + lg + a + rg + lg + a + rb + lw;
                    r = "(" + rr + p + rg + ")/2.0 - (" + rb + ")/1.0";
                    break;
                case Helper.Blue:
                    cond = rr + lw + a + rg + lw + a + rb + lg;
                    r = "(" + rb + ")/1.0 - (" + rr + p + rg + ")/2.0";
                    break;
                case Helper.Red:
                    cond = rr + lg + a + rg + lw + a + rb + lw;
                    r = "(" + rr + ")/1.0 - (" + rg + p + rb + ")/2.0";
                    break;
                case Helper.Green:
                    cond = rr + lw + a + rg + lg + a + rb + lw;
                    r = "(" + rg + ")/1.0 - (" + rr + p + rb + ")/2.0";
                    break;
                case Helper.Black:
                    cond = rr + lw + a + rg + lw + a + rb + lw;
                    r = "1.0-(" + rr + p + rg + p + rb + ")/3.0";
                    break;
            }
            var sresult = " if( " + cond + " ) { vec4 oldrs#[Ind] = vec4(result);float al#[Ind] = max(0.0,min(1.0," + r + "+(" + Shader.Print(d2) + "))); float  l#[Ind] =  1.0-al#[Ind];  " + mat + " result = result*al#[Ind] +  oldrs#[Ind] * l#[Ind];    }";
            sresult = Shader.Replace(sresult, '#[Ind]', "_" + Shader.Indexer + "_");
            this.Body = Shader.Def(this.Body, "");
            this.Body += sresult;
            return this;
        };
        ShaderBuilder.prototype.Blue = function (index, mat, option) {
            return this.ReplaceColor(index, Helper.Blue, mat, option);
        };
        ShaderBuilder.prototype.Cyan = function (index, mat, option) {
            return this.ReplaceColor(index, Helper.Cyan, mat, option);
        };
        ShaderBuilder.prototype.Red = function (index, mat, option) {
            return this.ReplaceColor(index, Helper.Red, mat, option);
        };
        ShaderBuilder.prototype.Yellow = function (index, mat, option) {
            return this.ReplaceColor(index, Helper.Yellow, mat, option);
        };
        ShaderBuilder.prototype.Green = function (index, mat, option) {
            return this.ReplaceColor(index, Helper.Green, mat, option);
        };
        ShaderBuilder.prototype.Pink = function (index, mat, option) {
            return this.ReplaceColor(index, Helper.Pink, mat, option);
        };
        ShaderBuilder.prototype.White = function (index, mat, option) {
            return this.ReplaceColor(index, Helper.White, mat, option);
        };
        ShaderBuilder.prototype.Black = function (index, mat, option) {
            return this.ReplaceColor(index, Helper.Black, mat, option);
        };
        ShaderBuilder.prototype.ReflectCube = function (option) {
            Shader.Indexer++;
            option = Shader.Def(option, { path: '/images/cube/a' });
            var s = Shader.Me.GetCubeMapIndex(option.path);
            if (s == -1) {
                Shader.Me.Setting.TextureCubes.push({ key: option.path, inVertex: option.useInVertex, inFragment: true });
            }
            else {
                Shader.Me.Setting.TextureCubes[s].inVertex = true;
            }
            s = Shader.Me.GetCubeMapIndex(option.path);
            option.normal = Shader.Def(option.normal, Normals.Map);
            option.alpha = Shader.Def(option.alpha, false);
            option.bias = Shader.Def(option.bias, "0.");
            option.normalLevel = Shader.Def(option.normalLevel, 1.0);
            option.rotation = Shader.Def(option.rotation, { x: 0, y: 0, z: 0 });
            option.scaleX = Shader.Def(option.scaleX, 1.);
            option.scaleY = Shader.Def(option.scaleY, 1.);
            option.useInVertex = Shader.Def(option.useInVertex, false);
            option.x = Shader.Def(option.x, 0.0);
            option.y = Shader.Def(option.y, 0.0);
            option.uv = Shader.Def(option.uv, ShaderMaterialHelperStatics.Uv);
            option.reflectMap = Shader.Def(option.reflectMap, "1.");
            Shader.Me.Setting.Center = true;
            Shader.Me.Setting.Camera = true;
            Shader.Me.Setting.ReflectMatrix = true;
            var sresult = "";
            if (option.equirectangular) {
                option.path = Shader.Def(option.path, '/images/cube/roofl1.jpg');
                var s = Shader.Me.GetMapIndex(option.path);
                if (s == -1) {
                    Shader.Me.Setting.Texture2Ds.push({ key: option.path, inVertex: option.useInVertex, inFragment: true });
                }
                else {
                    Shader.Me.Setting.Texture2Ds[s].inVertex = true;
                }
                s = Shader.Me.GetMapIndex(option.path);
                Shader.Me.Setting.VertexWorld = true;
                Shader.Me.Setting.FragmentWorld = true;
                sresult = ' vec3 nWorld#[Ind] = normalize( mat3( world[0].xyz, world[1].xyz, world[2].xyz ) *  ' + option.normal + '); ' +
                    ' vec3 vReflect#[Ind] = normalize( reflect( normalize(  ' + ShaderMaterialHelperStatics.Camera + '- vec3(world * vec4(' + ShaderMaterialHelperStatics.Position + ', 1.0))),  nWorld#[Ind] ) ); ' +
                    'float yaw#[Ind] = .5 - atan( vReflect#[Ind].z, -1.* vReflect#[Ind].x ) / ( 2.0 * 3.14159265358979323846264);  ' +
                    ' float pitch#[Ind] = .5 - atan( vReflect#[Ind].y, length( vReflect#[Ind].xz ) ) / ( 3.14159265358979323846264);  ' +
                    ' vec3 color#[Ind] = texture2D( ' + ShaderMaterialHelperStatics.Texture2D + s + ', vec2( yaw#[Ind], pitch#[Ind])' + (option.bias == null || Shader.Print(option.bias) == '0.' ? "" : "," + Shader.Print(option.bias)) + ' ).rgb; result = vec4(color#[Ind] ,1.);';
            }
            else {
                option.path = Shader.Def(option.path, "/images/cube/a");
                sresult = [
                    "vec3 viewDir#[Ind] =  " + ShaderMaterialHelperStatics.Position + " - " + ShaderMaterialHelperStatics.Camera + " ;",
                    "  viewDir#[Ind] =r_x(viewDir#[Ind] ," + Shader.Print(option.rotation.x) + ",  " + ShaderMaterialHelperStatics.Center + ");",
                    "  viewDir#[Ind] =r_y(viewDir#[Ind] ," + Shader.Print(option.rotation.y) + "," + ShaderMaterialHelperStatics.Center + ");",
                    "  viewDir#[Ind] =r_z(viewDir#[Ind] ," + Shader.Print(option.rotation.z) + "," + ShaderMaterialHelperStatics.Center + ");",
                    "vec3 coords#[Ind] = " + (option.refract ? "refract" : "reflect") + "(viewDir#[Ind]" + (option.revers ? "*vec3(1.0)" : "*vec3(-1.0)") + ", " + option.normal + " " + (option.refract ? ",(" + Shader.Print(option.refractMap) + ")" : "") + " )+" + ShaderMaterialHelperStatics.Position + "; ",
                    "vec3 vReflectionUVW#[Ind] = vec3( " + ShaderMaterialHelperStatics.ReflectMatrix + " *  vec4(coords#[Ind], 0)); ",
                    "vec3 rc#[Ind]= textureCube(" +
                        ShaderMaterialHelperStatics.TextureCube + s + ", vReflectionUVW#[Ind] " + (option.bias == null || Shader.Print(option.bias) == '0.' ? "" : "," + Shader.Print(option.bias)) + ").rgb;",
                    "result =result  + vec4(rc#[Ind].x ,rc#[Ind].y,rc#[Ind].z, " + (!option.alpha ? "1." : "(rc#[Ind].x+rc#[Ind].y+rc#[Ind].z)/3.0 ") + ")*(min(1.,max(0.," + Shader.Print(option.reflectMap) + ")));  "
                ].join('\n\
            ');
            }
            sresult = Shader.Replace(sresult, '#[Ind]', "_" + Shader.Indexer + "_");
            this.Body = Shader.Def(this.Body, "");
            this.Body += sresult;
            return this;
        };
        ShaderBuilder.prototype.NormalMap = function (val, mat) {
            Shader.Me.Setting.NormalOpacity = val;
            Shader.Me.Setting.NormalMap = mat;
            return this;
        };
        ShaderBuilder.prototype.SpecularMap = function (mat) {
            Shader.Me.Setting.SpecularMap = mat;
            return this;
        };
        ShaderBuilder.prototype.Instance = function () {
            var setting = Shader.Me.Setting;
            var instance = new ShaderBuilder();
            instance.Parent = Shader.Me;
            instance.Setting = setting;
            return instance;
        };
        ShaderBuilder.prototype.Reflect = function (option, opacity) {
            opacity = Shader.Def(opacity, 1.);
            return this.Multi(["result = result;", { result: this.Instance().ReflectCube(option).Build(), opacity: opacity }], true);
        };
        ShaderBuilder.prototype.Light = function (option) {
            option = Shader.Def(option, {});
            option.color = Shader.Def(option.color, { r: 1., g: 1., b: 1., a: 1. });
            option.darkColorMode = Shader.Def(option.darkColorMode, false);
            option.direction = Shader.Def(option.direction, "vec3(sin(time*0.02)*28.,sin(time*0.02)*8.+10.,cos(time*0.02)*28.)");
            option.normal = Shader.Def(option.normal, Normals.Map);
            option.rotation = Shader.Def(option.rotation, { x: 0., y: 0., z: 0. });
            option.specular = Shader.Def(option.specular, Speculars.Map);
            option.specularLevel = Shader.Def(option.specularLevel, 1.);
            option.specularPower = Shader.Def(option.specularPower, 1.);
            option.phonge = Shader.Def(option.phonge, 0.);
            option.phongePower = Shader.Def(option.phongePower, 1.);
            option.phongeLevel = Shader.Def(option.phongeLevel, 1.);
            option.supplement = Shader.Def(option.supplement, false);
            option.reducer = Shader.Def(option.reducer, '1.');
            var c_c = option.color;
            if (option.darkColorMode) {
                c_c.a = 1.0 - c_c.a;
                c_c.r = 1.0 - c_c.r;
                c_c.g = 1.0 - c_c.g;
                c_c.b = 1.0 - c_c.b;
                c_c.a = c_c.a - 1.0;
            }
            Shader.Indexer++;
            Shader.Me.Setting.Camera = true;
            Shader.Me.Setting.FragmentWorld = true;
            Shader.Me.Setting.VertexWorld = true;
            Shader.Me.Setting.Helpers = true;
            Shader.Me.Setting.Center = true;
            var sresult = Shader.Join([
                "  vec3 dir#[Ind] = normalize(  vec3(world * vec4(" + ShaderMaterialHelperStatics.Position + ",1.)) - " + ShaderMaterialHelperStatics.Camera + ");",
                "  dir#[Ind] =r_x(dir#[Ind] ," + Shader.Print(option.rotation.x) + ",vec3(" + ShaderMaterialHelperStatics.Center + "));",
                "  dir#[Ind] =r_y(dir#[Ind] ," + Shader.Print(option.rotation.y) + ",vec3(" + ShaderMaterialHelperStatics.Center + "));",
                "  dir#[Ind] =r_z(dir#[Ind] ," + Shader.Print(option.rotation.z) + ",vec3(" + ShaderMaterialHelperStatics.Center + "));",
                "  vec4 p1#[Ind] = vec4(" + option.direction + ",.0);                                ",
                "  vec4 c1#[Ind] = vec4(" + Shader.Print(c_c.r) + "," + Shader.Print(c_c.g) + "," + Shader.Print(c_c.b) + ",0.0); ",
                "  vec3 vnrm#[Ind] = normalize(vec3(world * vec4(" + option.normal + ", 0.0)));          ",
                "  vec3 l#[Ind]= normalize(p1#[Ind].xyz " +
                    (!option.parallel ? "- vec3(world * vec4(" + ShaderMaterialHelperStatics.Position + ",1.))  " : "")
                    + ");   ",
                "  vec3 vw#[Ind]= normalize(camera -  vec3(world * vec4(" + ShaderMaterialHelperStatics.Position + ",1.)));  ",
                "  vec3 aw#[Ind]= normalize(vw#[Ind]+ l#[Ind]);  ",
                "  float sc#[Ind]= max(0.,min(1., dot(vnrm#[Ind], aw#[Ind])));   ",
                "  sc#[Ind]= pow(sc#[Ind]*min(1.,max(0.," + Shader.Print(option.specular) + ")), (" + Shader.Print(option.specularPower * 1000.) + "))/" + Shader.Print(option.specularLevel) + " ;  ",
                " float  ph#[Ind]= pow(" + Shader.Print(option.phonge) + "*2., (" + Shader.Print(option.phongePower) + "*0.3333))/(" + Shader.Print(option.phongeLevel) + "*3.) ;  ",
                "  float ndl#[Ind] = max(0., dot(vnrm#[Ind], l#[Ind]));                            ",
                "  float ls#[Ind] = " + (option.supplement ? "1.0 -" : "") + "max(0.,min(1.,ndl#[Ind]*ph#[Ind]*(" + Shader.Print(option.reducer) + "))) ;         ",
                "  result  += vec4( c1#[Ind].xyz*( ls#[Ind])*" + Shader.Print(c_c.a) + " ,  ls#[Ind]); ",
                "  float ls2#[Ind] = " + (option.supplement ? "0.*" : "1.*") + "max(0.,min(1., sc#[Ind]*(" + Shader.Print(option.reducer) + "))) ;         ",
                "  result  += vec4( c1#[Ind].xyz*( ls2#[Ind])*" + Shader.Print(c_c.a) + " ,  ls2#[Ind]); ",
            ]);
            sresult = Shader.Replace(sresult, '#[Ind]', "_" + Shader.Indexer + "_");
            this.Body = Shader.Def(this.Body, "");
            this.Body += sresult;
            return this;
        };
        ShaderBuilder.prototype.Effect = function (option) {
            var op = Shader.Def(option, {});
            Shader.Indexer++;
            var sresult = [
                'vec4 res#[Ind] = vec4(0.);',
                'res#[Ind].x = ' + (op.px ? Shader.Replace(Shader.Replace(Shader.Replace(Shader.Replace(op.px, 'px', 'result.x'), 'py', 'result.y'), 'pz', 'result.z'), 'pw', 'result.w') + ';' : ' result.x;'),
                'res#[Ind].y = ' + (op.py ? Shader.Replace(Shader.Replace(Shader.Replace(Shader.Replace(op.py, 'px', 'result.x'), 'py', 'result.y'), 'pz', 'result.z'), 'pw', 'result.w') + ';' : ' result.y;'),
                'res#[Ind].z = ' + (op.pz ? Shader.Replace(Shader.Replace(Shader.Replace(Shader.Replace(op.pz, 'px', 'result.x'), 'py', 'result.y'), 'pz', 'result.z'), 'pw', 'result.w') + ';' : ' result.z;'),
                'res#[Ind].w = ' + (op.pw ? Shader.Replace(Shader.Replace(Shader.Replace(Shader.Replace(op.pw, 'px', 'result.x'), 'py', 'result.y'), 'pz', 'result.z'), 'pw', 'result.w') + ';' : ' result.w;'),
                'res#[Ind]  = ' + (op.pr ? ' vec4(' + Shader.Replace(Shader.Replace(Shader.Replace(Shader.Replace(Shader.Replace(op.pr, 'pr', 'res#[Ind].x'), 'px', 'result.x'), 'py', 'result.y'), 'pz', 'result.z'), 'pw', 'result.w') + ','
                    + Shader.Replace(Shader.Replace(Shader.Replace(Shader.Replace(Shader.Replace(op.pr, 'pr', 'res#[Ind].y'), 'px', 'result.x'), 'py', 'result.y'), 'pz', 'result.z'), 'pw', 'result.w') + ',' +
                    Shader.Replace(Shader.Replace(Shader.Replace(Shader.Replace(Shader.Replace(op.pr, 'pr', 'res#[Ind].z'), 'px', 'result.x'), 'py', 'result.y'), 'pz', 'result.z'), 'pw', 'result.w')
                    + ',' +
                    Shader.Replace(Shader.Replace(Shader.Replace(Shader.Replace(Shader.Replace(op.pr, 'pr', 'res#[Ind].w'), 'px', 'result.x'), 'py', 'result.y'), 'pz', 'result.z'), 'pw', 'result.w')
                    + ');' : ' res#[Ind]*1.0;'),
                'result = res#[Ind] ;'
            ].join('\n\
');
            sresult = Shader.Replace(sresult, '#[Ind]', "_" + Shader.Indexer + "_");
            this.Body = Shader.Def(this.Body, "");
            this.Body += sresult;
            return this;
        };
        ShaderBuilder.prototype.IdColor = function (id, w) {
            var kg = { r: 0.0, g: 0.0, b: .0 };
            kg = Shader.torgb(id.valueOf() * 1.0, 255);
            this.Body = Shader.Def(this.Body, "");
            this.Body += 'result = vec4(' + Shader.Print(kg.r) + ',' + Shader.Print(kg.g) + ',' + Shader.Print(Math.max(kg.b, 0.0)) + ',' + Shader.Print(w) + ');';
            return this;
        };
        ShaderBuilder.prototype.Discard = function () {
            this.Body = Shader.Def(this.Body, "");
            this.Body += 'discard;';
            return this;
        };
        return ShaderBuilder;
    }());
    BABYLONX.ShaderBuilder = ShaderBuilder;
})(BABYLONX || (BABYLONX = {}));


var BABYLONX;
(function (BABYLONX) {
    var GeometryBuilder = (function () {
        function GeometryBuilder() {
        }
        GeometryBuilder.GetTotalLength = function (path) {
            return null;
        };
        GeometryBuilder.Dim = function (v, u) {
            return Math.sqrt(Math.pow(u.x - v.x, 2.) + Math.pow(u.y - v.y, 2.) + (GeometryBuilder.Def(u.z, GeometryBuilder._null) ? Math.pow(u.z - v.z, 2.) : 0));
        };
        GeometryBuilder.Def = function (a, d) {
            if (a != undefined && a != null)
                return (d != undefined && d != null ? a : true);
            else if (d != GeometryBuilder._null)
                return (d != undefined && d != null ? d : false);
            return null;
        };
        GeometryBuilder.Replace = function (s, t, d) {
            var ignore = null;
            return s.replace(new RegExp(t.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (d) == "string") ? d.replace(/\$/g, "$$$$") : d);
        };
        GeometryBuilder.AddUv = function (faceUV, geo, index, uvs, uve) {
            if (!faceUV || faceUV.length == 0 || faceUV.length < index) {
                geo.uvs.push(uvs.u, uvs.v);
                return;
            }
            if (faceUV[index].toString() == "0")
                geo.uvs.push(uvs.u, uvs.v);
            if (faceUV[index].toString() == "1")
                geo.uvs.push(uvs.u, uve.v);
            if (faceUV[index].toString() == "2")
                geo.uvs.push(uve.u, uvs.v);
            if (faceUV[index].toString() == "3")
                geo.uvs.push(uve.u, uve.v);
        };
        ;
        GeometryBuilder.Exchange = function (p) {
            if (!GeometryBuilder.Def(p, GeometryBuilder._null))
                return false;
            return (p.x || p.x == 0.0);
        };
        GeometryBuilder.PushVertex = function (geo, p1, uv) {
            if (uv)
                uv = { u: 0., v: 0. };
            geo.vertices.push({ x: p1.x, y: p1.y, z: p1.z });
            geo.positions.push(p1.x, p1.y, p1.z);
            if (uv)
                geo.uvs.push(uv.u, uv.v);
            return geo.vertices.length - 1;
        };
        GeometryBuilder.MakeFace = function (geo, _points, option) {
            if (!option)
                option = {
                    faceUVMap: "",
                    pointIndex1: null,
                    pointIndex2: null,
                    pointIndex3: null,
                    pointIndex4: null,
                    uvStart: null,
                    uvEnd: null,
                    Face3Point: false,
                    flip: false,
                    onlyPush: false
                };
            var points = { point1: _points[0], point2: _points[1], point3: _points[2], point4: _points[3] };
            if (!option.uvStart)
                option.uvStart = { u: 0., v: 0. };
            if (!option.uvEnd)
                option.uvEnd = { u: 1., v: 1. };
            if (option.onlyPush || GeometryBuilder.Exchange(points.point1)) {
                geo.vertices.push({ x: points.point1.x, y: points.point1.y, z: points.point1.z });
                geo.positions.push(points.point1.x, points.point1.y, points.point1.z);
                GeometryBuilder.AddUv(option.faceUVMap, geo, 0, option.uvStart, option.uvEnd);
                option.pointIndex1 = geo.vertices.length - 1;
            }
            if (option.onlyPush || GeometryBuilder.Exchange(points.point2)) {
                geo.vertices.push({ x: points.point2.x, y: points.point2.y, z: points.point2.z });
                geo.positions.push(points.point2.x, points.point2.y, points.point2.z);
                GeometryBuilder.AddUv(option.faceUVMap, geo, 1, option.uvStart, option.uvEnd);
                option.pointIndex2 = geo.vertices.length - 1;
            }
            if (option.onlyPush || GeometryBuilder.Exchange(points.point3)) {
                geo.vertices.push({ x: points.point3.x, y: points.point3.y, z: points.point3.z });
                geo.positions.push(points.point3.x, points.point3.y, points.point3.z);
                GeometryBuilder.AddUv(option.faceUVMap, geo, 2, option.uvStart, option.uvEnd);
                option.pointIndex3 = geo.vertices.length - 1;
            }
            if (!option.Face3Point) {
                if (option.onlyPush || GeometryBuilder.Exchange(points.point4)) {
                    geo.vertices.push({ x: points.point4.x, y: points.point4.y, z: points.point4.z });
                    geo.positions.push(points.point4.x, points.point4.y, points.point4.z);
                    GeometryBuilder.AddUv(option.faceUVMap, geo, 3, option.uvStart, option.uvEnd);
                    option.pointIndex4 = geo.vertices.length - 1;
                }
            }
            if (!option.onlyPush) {
                if (option.pointIndex1 == null || option.pointIndex1 == undefined)
                    option.pointIndex1 = points.point1;
                if (option.pointIndex2 == null || option.pointIndex2 == undefined)
                    option.pointIndex2 = points.point2;
                if (option.pointIndex3 == null || option.pointIndex3 == undefined)
                    option.pointIndex3 = points.point3;
                if (!option.Face3Point) {
                    if (option.pointIndex4 == null || option.pointIndex4 == undefined)
                        option.pointIndex4 = points.point4;
                }
                if (!GeometryBuilder.Def(GeometryBuilder.isInOption, GeometryBuilder._null)) {
                    if (option.flip) {
                        geo.faces.push(option.pointIndex1, option.pointIndex2, option.pointIndex3);
                        if (!option.Face3Point)
                            geo.faces.push(option.pointIndex2, option.pointIndex4, option.pointIndex3);
                    }
                    else {
                        geo.faces.push(option.pointIndex1, option.pointIndex3, option.pointIndex2);
                        if (!option.Face3Point)
                            geo.faces.push(option.pointIndex2, option.pointIndex3, option.pointIndex4);
                    }
                }
                else {
                    if (option.flip) {
                        if (GeometryBuilder.isInOption.a && GeometryBuilder.isInOption.b && GeometryBuilder.isInOption.c)
                            geo.faces.push(option.pointIndex1, option.pointIndex2, option.pointIndex3);
                        if (GeometryBuilder.isInOption.b && GeometryBuilder.isInOption.d && GeometryBuilder.isInOption.c && !option.Face3Point)
                            geo.faces.push(option.pointIndex2, option.pointIndex4, option.pointIndex3);
                    }
                    else {
                        if (GeometryBuilder.isInOption.a && GeometryBuilder.isInOption.c && GeometryBuilder.isInOption.b)
                            geo.faces.push(option.pointIndex1, option.pointIndex3, option.pointIndex2);
                        if (GeometryBuilder.isInOption.b && GeometryBuilder.isInOption.c && GeometryBuilder.isInOption.d && !option.Face3Point)
                            geo.faces.push(option.pointIndex2, option.pointIndex3, option.pointIndex4);
                    }
                }
            }
            if (!option.onlyPush)
                GeometryBuilder.isInOption = null;
            return [option.pointIndex1, option.pointIndex2, option.pointIndex3, option.pointIndex4];
        };
        GeometryBuilder.ImportGeometry = function (geo, v, f, ts) {
            var st = geo.vertices.length;
            for (var i = 0; i < v.length; i++) {
                geo.vertices.push({ x: v[i].x + (ts.x), y: v[i].y + (ts.y), z: v[i].z + (ts.z) });
                geo.positions.push(v[i].x + (ts.x), v[i].y + (ts.y), v[i].z + (ts.z));
            }
            for (var i = 0; i < f.length; i++) {
                if (!ts || !ts.checkFace || ts.face(i, f[i]))
                    geo.faces.push(f[i].a + st, f[i].b + st, f[i].c + st);
            }
        };
        GeometryBuilder.GeometryBase = function (firstp, builder, exGeo, custom) {
            var geo = {
                faces: [],
                vertices: [],
                normals: [],
                positions: [],
                uvs: [],
                uvs2: [],
                name: ""
            };
            if (!exGeo)
                exGeo = geo;
            if (builder) {
                builder(firstp, exGeo);
            }
            if (custom) {
                exGeo = custom(exGeo);
            }
            return exGeo;
        };
        GeometryBuilder.GetGeometryFromBabylon = function (geo, to) {
            to.faces = geo.indices;
            to.positions = geo.positions;
            to.normals = geo.normals;
            to.uvs = geo.uvs;
            return to;
        };
        GeometryBuilder.GetPoints = function (op) {
            var h1 = 1;
            function getLenRounded(pat, i) {
                var i = pat.getPointAtLength(i);
                return i; //{ x: round(i.x * ik) / ik, y: round(i.y * ik) / ik };
            }
            op.step = GeometryBuilder.Def(op.step, 0.5);
            var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", op.path);
            var result = [];
            var len = GeometryBuilder.GetTotalLength(path); //path.getTotalLength();
            if (GeometryBuilder.Def(op.inLine, GeometryBuilder._null) && (!GeometryBuilder.Def(op.pointLength, GeometryBuilder._null) || op.pointLength < 1000)) {
                op.step = 0.3;
            }
            if (GeometryBuilder.Def(op.pointLength, GeometryBuilder._null)) {
                op.min = len / op.pointLength;
            }
            var plen = 0.0;
            var s = getLenRounded(path, 0);
            op.density = GeometryBuilder.Def(op.density, [1]);
            function getDensityMapStep(index) {
                var ps = Math.floor(op.density.length * (index / len));
                return op.step / op.density[ps];
            }
            var p = s;
            var c = getLenRounded(path, op.step);
            plen += op.step;
            op.push(result, s);
            var p_o = 0;
            var oo_p = { x: 0, y: 0 };
            for (var i = op.step * 2; i < len; i += getDensityMapStep(i)) {
                h1++;
                var n = getLenRounded(path, i);
                plen += op.step;
                if (GeometryBuilder.Def(op.inLine, true)) {
                    if (i == op.step * 2)
                        op.push(result, c);
                    if (plen > GeometryBuilder.Def(op.min, 10.)) {
                        op.push(result, n);
                        plen = 0.0;
                    }
                }
                else {
                    var d1 = GeometryBuilder.Dim(p, c);
                    var d2 = GeometryBuilder.Dim(c, n);
                    var d3 = GeometryBuilder.Dim(p, n);
                    var d4 = 0;
                    var d5 = 0;
                    if (GeometryBuilder.Def(p_o, GeometryBuilder._null)) {
                        d4 = GeometryBuilder.Dim(p_o, c);
                        d5 = GeometryBuilder.Dim(p_o, n);
                    }
                    var iilen = Math.abs(d3 - (d2 + d1));
                    var lll = GeometryBuilder.SvgCalibration;
                    if (iilen > lll || p_o > lll) {
                        if (GeometryBuilder.Dim(n, oo_p) > 4.0) {
                            op.push(result, n);
                            oo_p = n;
                        }
                        plen = 0.0;
                        p_o = 0;
                    }
                    else {
                        p_o += iilen;
                    }
                }
                p = c;
                c = n;
            }
            result = op.push(result, getLenRounded(path, len), true);
            var sr = [];
            var i = 0;
            for (i = GeometryBuilder.Def(op.start, 0); i < result.length - GeometryBuilder.Def(op.end, 0); i++) {
                sr.push(result[i]);
            }
            return sr;
        };
        GeometryBuilder.BuildBabylonMesh = function (scene, geo) {
            return null;
        };
        GeometryBuilder.ToBabylonGeometry = function (geo) {
            return null;
        };
        GeometryBuilder.InitializeEngine = function () {
            eval("BABYLONX.GeometryBuilder.ToBabylonGeometry = function(op) {    var vertexData = new BABYLON.VertexData();  vertexData.indices = op.faces;    vertexData.positions = op.positions;    vertexData.normals = op.normals; vertexData.uvs = op.uvs;    if (BABYLONX.GeometryBuilder.Def(op.uv2s , GeometryBuilder._null))        vertexData.uv2s = op.uv2s;    else        vertexData.uv2s = [];    return vertexData; } ");
            eval('BABYLONX.GeometryBuilder.GetTotalLength = function(path){return path.getTotalLength();}');
            eval("BABYLONX.GeometryBuilder.BuildBabylonMesh = function(opscene,opgeo){        var geo = BABYLONX.GeometryBuilder.ToBabylonGeometry(opgeo);    var mesh = new BABYLON.Mesh(  opgeo.name, opscene);    geo.normals = BABYLONX.GeometryBuilder.Def(geo.normals, []);    try {  BABYLON.VertexData.ComputeNormals(geo.positions, geo.indices, geo.normals);    } catch (e) {    }    geo.applyToMesh(mesh, false);  var center = { x: 0, y: 0, z: 0 };  for (i = 0; i < geo.positions.length; i += 3.0) {  center.x += geo.positions[i];  center.y += geo.positions[i + 1];  center.z += geo.positions[i + 2];  }  center = { x: center.x * 3.0 / geo.positions.length, y: center.y * 3.0 / geo.positions.length, z: center.z * 3.0 / geo.positions.length };    mesh.center = center;    return mesh; }");
        };
        GeometryBuilder.isInOption = null;
        GeometryBuilder.face3UV012 = "012";
        GeometryBuilder.face3UV021 = "021";
        GeometryBuilder.face3UV201 = "201";
        GeometryBuilder.face3UV210 = "210";
        GeometryBuilder.face4UV0123 = "0123";
        GeometryBuilder.face4UV0132 = "0132";
        GeometryBuilder.face4UV1023 = "1023";
        GeometryBuilder.face4UV1032 = "1032";
        GeometryBuilder._null = 'set null anyway';
        GeometryBuilder.SvgCalibration = 0.00001;
        return GeometryBuilder;
    })();
    BABYLONX.GeometryBuilder = GeometryBuilder;
    var Geometry = (function () {
        function Geometry(geo) {
            if (geo == null) {
                geo = {
                    faces: [],
                    vertices: [],
                    normals: [],
                    positions: [],
                    uvs: [],
                    uvs2: [],
                    name: ""
                };
            }
            this.faces = GeometryBuilder.Def(geo.faces, []);
            this.positions = GeometryBuilder.Def(geo.positions, []);
            this.vertices = GeometryBuilder.Def(geo.vertices, []);
            this.normals = GeometryBuilder.Def(geo.normals, []);
            this.uvs = GeometryBuilder.Def(geo.uvs, []);
            this.uvs2 = GeometryBuilder.Def(geo.uvs2, []);
            this.name = geo.name;
        }
        Geometry.prototype.toMesh = function (scene) {
            var mesh = GeometryBuilder.BuildBabylonMesh(scene, this);
            return mesh;
        };
        return Geometry;
    })();
    BABYLONX.Geometry = Geometry;
    var GeometryParser = (function () {
        function GeometryParser(data, lastUV, flip) {
            var GP = GeometryParser;
            this.Objects = GP.def(this.Objects, []);
            this.Uv_update = lastUV;
            this.Uvs_helper1 = [];
            this.Flip = flip;
            if (/^o /gm.test(data) === false) {
                this.Geometry = new Geometry(null);
                this.Objects.push(this.Geometry);
            }
            var lines = data.split('\n');
            var oldIndex = 0;
            var oldLine = '';
            var lastchar = '';
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                line = line.trim();
                var result;
                if (line.length === 0 || line.charAt(0) === '#') {
                    continue;
                }
                else if ((result = GP.VertexPattern.exec(line)) !== null) {
                    // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
                    if (lastchar == 'g')
                        this.NewGeo();
                    GeometryBuilder.PushVertex(GP.n_1(this.Objects), { x: -1 * result[1], y: result[2] * 1.0, z: result[3] * 1.0 }, null); // un !uc
                    lastchar = 'v';
                }
                else if ((result = GP.NormalPattern.exec(line)) !== null) {
                    lastchar = 'n';
                }
                else if ((result = GP.UVPattern.exec(line)) !== null) {
                    // ["vt 0.1 0.2", "0.1", "0.2"]
                    this.Uvs_helper1.push({ x: parseFloat(result[1]), y: parseFloat(result[2]) });
                    // uvs.push({ x: result[1], y: result[2] });
                    lastchar = 't';
                }
                else if ((result = GP.FacePattern1.exec(line)) !== null) {
                    // ["f 1 2 3", "1", "2", "3", undefined]
                    this.Handle_face_line([result[1], result[2], result[3], result[4]], null, null);
                    lastchar = 'f';
                }
                else if ((result = GP.FacePattern2.exec(line)) !== null) {
                    // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
                    this.Handle_face_line([result[2], result[5], result[8], result[11]], //faces
                    [result[3], result[6], result[9], result[12]], null //uv
                    );
                    lastchar = 'f';
                }
                else if ((result = GP.FacePattern3.exec(line)) !== null) {
                    // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
                    this.Handle_face_line([result[2], result[6], result[10], result[14]], //faces
                    [result[3], result[7], result[11], result[15]], //uv
                    [result[4], result[8], result[12], result[16]] //normal
                    );
                    lastchar = 'f';
                }
                else if ((result = GP.FacePattern4.exec(line)) !== null) {
                    // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]
                    this.Handle_face_line([result[2], result[5], result[8], result[11]], //faces
                    [], //uv
                    [result[3], result[6], result[9], result[12]] //normal
                    );
                    lastchar = 'f';
                }
                else if (/^o /.test(line)) {
                    if (line.replace('o', '').trim() != 'default') {
                        oldLine = line.replace('o', '').trim();
                        if (oldLine != '' && this.Objects.length > 0)
                            GP.n_1(this.Objects).refname = oldLine;
                    }
                    else
                        oldLine = '';
                    this.NewGeo();
                    lastchar = 'o';
                }
                else if (/^g /.test(line)) {
                    if (line.replace('g', '').trim() != 'default') {
                        oldLine = line.replace('g', '').trim();
                        if (oldLine != '' && this.Objects.length > 0)
                            GP.n_1(this.Objects).refname = oldLine;
                    }
                    else
                        oldLine = '';
                    lastchar = 'g';
                }
                else if (/^usemtl /.test(line)) {
                    // material
                    // material.name = line.substring( 7 ).trim();
                    lastchar = 'u';
                }
                else if (/^mtllib /.test(line)) {
                    // mtl file
                    lastchar = 'm';
                }
                else if (/^s /.test(line)) {
                    // smooth shading 
                    lastchar = 's';
                }
            }
        }
        GeometryParser.def = function (a, d) {
            if (a != undefined && a != null)
                return (d != undefined && d != null ? a : true);
            else if (d != GeometryParser._null)
                return (d != undefined && d != null ? d : false);
            return null;
        };
        GeometryParser.n_1 = function (ar) {
            ar = GeometryParser.def(ar, []);
            if (!GeometryParser.def(ar.length, null))
                return null;
            return ar[ar.length - 1];
        };
        GeometryParser.prototype.Vector = function (x, y, z) {
            return { x: x, y: y, z: z };
        };
        GeometryParser.prototype.Face3 = function (a, b, c, normals) {
            return { x: a - GeometryParser.OldIndex, y: b - GeometryParser.OldIndex, z: c - GeometryParser.OldIndex };
        };
        GeometryParser.prototype.ParseVertexIndex = function (index) {
            index = parseInt(index);
            return index >= 0 ? index - 1 : index + GeometryParser.Vertices.length;
        };
        GeometryParser.prototype.ParseNormalIndex = function (index) {
            index = parseInt(index);
            return index >= 0 ? index - 1 : index + GeometryParser.Normals.length;
        };
        GeometryParser.prototype.ParseUVIndex = function (index) {
            index = parseInt(index);
            return index >= 0 ? index - 1 : 1.0;
        };
        GeometryParser.prototype.Add_face = function (a, b, c, uvs) {
            var GP = GeometryParser;
            a = this.ParseVertexIndex(a - GP.OldIndex);
            b = this.ParseVertexIndex(b - GP.OldIndex);
            c = this.ParseVertexIndex(c - GP.OldIndex);
            if (this.Uv_update) {
                if (GP.def(GP.n_1(this.Objects).uvs[a * 2], null) && GP.n_1(this.Objects).uvs[a * 2] != this.Uvs_helper1[this.ParseUVIndex(uvs[0])].x && GP.n_1(this.Objects).uvs[a * 2 + 1] != this.Uvs_helper1[this.ParseUVIndex(uvs[0])].y) {
                    this.NewVtx++;
                    a = GeometryBuilder.PushVertex(GP.n_1(this.Objects), { x: parseFloat(GP.n_1(this.Objects).positions[a * 3]), y: parseFloat(GP.n_1(this.Objects).positions[a * 3 + 1]), z: parseFloat(GP.n_1(this.Objects).positions[a * 3 + 2]) }, null); // uv !uc
                }
                if (GP.def(GP.n_1(this.Objects).uvs[b * 2], null) && GP.n_1(this.Objects).uvs[b * 2] != this.Uvs_helper1[this.ParseUVIndex(uvs[1])].x && GP.n_1(this.Objects).uvs[b * 2 + 1] != this.Uvs_helper1[this.ParseUVIndex(uvs[1])].y) {
                    b = GeometryBuilder.PushVertex(GP.n_1(this.Objects), { x: parseFloat(GP.n_1(this.Objects).positions[b * 3]), y: parseFloat(GP.n_1(this.Objects).positions[b * 3 + 1]), z: parseFloat(GP.n_1(this.Objects).positions[b * 3 + 2]) }, null); // uv !uc
                    this.NewVtx++;
                }
                if (GP.def(GP.n_1(this.Objects).uvs[c * 2], null) && GP.n_1(this.Objects).uvs[c * 2] != this.Uvs_helper1[this.ParseUVIndex(uvs[2])].x && GP.n_1(this.Objects).uvs[c * 2 + 1] != this.Uvs_helper1[this.ParseUVIndex(uvs[2])].y) {
                    c = GeometryBuilder.PushVertex(GP.n_1(this.Objects), { x: parseFloat(GP.n_1(this.Objects).positions[c * 3]), y: parseFloat(GP.n_1(this.Objects).positions[c * 3 + 1]), z: parseFloat(GP.n_1(this.Objects).positions[c * 3 + 2]) }, null); // uv !uc
                    this.NewVtx++;
                }
            }
            GeometryBuilder.MakeFace(GP.n_1(this.Objects), [a,
                b,
                c], {
                faceUVMap: GeometryBuilder.face3UV012,
                Face3Point: true,
                pointIndex1: null,
                pointIndex2: null,
                pointIndex3: null,
                pointIndex4: null,
                uvStart: null,
                uvEnd: null,
                flip: this.Flip, onlyPush: false
            });
            var faceIndex = GP.n_1(this.Objects).faces.length;
            try {
                if (!GP.def(GP.n_1(this.Objects).uvs[a * 2], null))
                    GP.n_1(this.Objects).uvs[a * 2] = this.Uvs_helper1[this.ParseUVIndex(uvs[0])].x;
                if (!GP.def(GP.n_1(this.Objects).uvs[a * 2 + 1], null))
                    GP.n_1(this.Objects).uvs[a * 2 + 1] = this.Uvs_helper1[this.ParseUVIndex(uvs[0])].y;
                if (!GP.def(GP.n_1(this.Objects).uvs[b * 2], null))
                    GP.n_1(this.Objects).uvs[b * 2] = this.Uvs_helper1[this.ParseUVIndex(uvs[1])].x;
                if (!GP.def(GP.n_1(this.Objects).uvs[b * 2 + 1], null))
                    GP.n_1(this.Objects).uvs[b * 2 + 1] = this.Uvs_helper1[this.ParseUVIndex(uvs[1])].y;
                if (!GP.def(GP.n_1(this.Objects).uvs[c * 2], null))
                    GP.n_1(this.Objects).uvs[c * 2] = this.Uvs_helper1[this.ParseUVIndex(uvs[2])].x;
                if (!GP.def(GP.n_1(this.Objects).uvs[c * 2 + 1], null))
                    GP.n_1(this.Objects).uvs[c * 2 + 1] = this.Uvs_helper1[this.ParseUVIndex(uvs[2])].y;
                GP.n_1(this.Objects).uvh = GP.def(GP.n_1(this.Objects).uvh, []);
                GP.n_1(this.Objects).uvf = GP.def(GP.n_1(this.Objects).uvf, []);
                GP.n_1(this.Objects).uvh[a] = GP.def(GP.n_1(this.Objects).uvh[a], []);
                GP.n_1(this.Objects).uvh[b] = GP.def(GP.n_1(this.Objects).uvh[b], []);
                GP.n_1(this.Objects).uvh[c] = GP.def(GP.n_1(this.Objects).uvh[c], []);
                GP.n_1(this.Objects).uvh[a * 2] = (this.Uvs_helper1[this.ParseUVIndex(uvs[0])].x);
                GP.n_1(this.Objects).uvh[a * 2 + 1] = (this.Uvs_helper1[this.ParseUVIndex(uvs[0])].y);
                GP.n_1(this.Objects).uvf[a] = faceIndex;
                GP.n_1(this.Objects).uvh[b * 2] = (this.Uvs_helper1[this.ParseUVIndex(uvs[1])].x);
                GP.n_1(this.Objects).uvh[b * 2 + 1] = (this.Uvs_helper1[this.ParseUVIndex(uvs[1])].y);
                GP.n_1(this.Objects).uvf[b] = faceIndex;
                GP.n_1(this.Objects).uvh[c * 2] = (this.Uvs_helper1[this.ParseUVIndex(uvs[2])].x);
                GP.n_1(this.Objects).uvh[c * 2 + 1] = (this.Uvs_helper1[this.ParseUVIndex(uvs[2])].y);
                GP.n_1(this.Objects).uvf[c] = faceIndex;
            }
            catch (e) {
            }
        };
        GeometryParser.prototype.Handle_face_line = function (faces, uvs, normals_inds) {
            var GP = GeometryParser;
            uvs = GP.def(uvs, [0, 0, 0, 0]);
            if (faces[3] === undefined) {
                this.Add_face(faces[0], faces[1], faces[2], uvs);
            }
            else {
                this.Add_face(faces[0], faces[1], faces[3], [uvs[0], uvs[1], uvs[3]]);
                this.Add_face(faces[1], faces[2], faces[3], [uvs[1], uvs[2], uvs[3]]);
            }
        };
        //
        GeometryParser.prototype.NewGeo = function () {
            var GP = GeometryParser;
            if (this.Objects.length == 0 || GP.n_1(this.Objects).vertices.length > 0) {
                GP.OldIndex += GP.n_1(this.Objects).length > 0 ? GP.n_1(this.Objects).vertices.length - this.NewVtx : 0;
                this.NewVtx = 0;
                this.Geometry = new Geometry(null);
                this.Objects.push(this.Geometry);
            }
        };
        GeometryParser.OldIndex = 0;
        GeometryParser.Vertices = [];
        GeometryParser.Normals = [];
        GeometryParser._null = "null all time";
        // v float float float
        GeometryParser.VertexPattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
        // vn float float float
        GeometryParser.NormalPattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
        // vt float float
        GeometryParser.UVPattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
        // f vertex vertex vertex ...
        GeometryParser.FacePattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;
        // f vertex/uv vertex/uv vertex/uv ...
        GeometryParser.FacePattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;
        // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...
        GeometryParser.FacePattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;
        // f vertex//normal vertex//normal vertex//normal ... 
        GeometryParser.FacePattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/;
        return GeometryParser;
    })();
    BABYLONX.GeometryParser = GeometryParser;
})(BABYLONX || (BABYLONX = {}));
//# sourceMappingURL=GeometryBuilder.js.map



function def(a, d) {
    if (a != undefined && a != null) return (d != undefined && d != null ? a : true);
    else
        if (d != _null)
            return (d != undefined && d != null ? d : false);
    return null;
}

 
function rotate_xy(pr1, pr2, alpha) {
    pp2 = { x: pr2.x - pr1.x, y: pr2.y - pr1.y };

    return {
        x: pr1.x + pp2.x * cos(alpha) - pp2.y * sin(alpha),
        y: pr1.y + pp2.x * sin(alpha) + pp2.y * cos(alpha)
    };
}

function r_y(n, a, c) {

    c = def(c, { x: 0, y: 0, z: 0 });
    var c1 = { x: c.x, y: c.y, z: c.z };
    c1.x = c1.x;
    c1.y = c1.z;

    var p = rotate_xy(c1, { x: n.x, y: n.z }, a);

    n.x = p.x;
    n.z = p.y;

    return n;

}

function r_x(n, a, c) {

    c = def(c, { x: 0, y: 0, z: 0 });
    var c1 = { x: c.x, y: c.y, z: c.z };
    c1.x = c1.y;
    c1.y = c1.z;

    var p = rotate_xy(c1, { x: n.y, y: n.z }, a);

    n.y = p.x;
    n.z = p.y;

    return n;

}

function r_z(n, a, c) {

    c = def(c, { x: 0, y: 0, z: 0 });
    var c1 = { x: c.x, y: c.y, z: c.z };
    var p = rotate_xy(c1, { x: n.x, y: n.y }, a);

    n.x = p.x;
    n.y = p.y;

    return n;

}

// math base 
var floor = Math.floor;
var sin = Math.sin;
var cos = Math.cos;
var tan = Math.tan;
var atan = Math.atan;
var asin = Math.asin;
var acos = Math.acos;
var pow = function (x, y) { return Math.pow(x, (y ? y : 2.)); }
var ceil = Math.ceil;
var abs = Math.abs;
var exp = Math.exp;
var log = Math.log;
var max = Math.max;
var min = Math.min;
var random = Math.random;

// 
function r3(x) { return floor(x * 1000) / 1000; }
function r2(x) { return floor(x * 100) / 100; }
function r1(x) { return floor(x * 10) / 10; }
function r_3(x) { return floor(x * 1000000) / 1000 }
function r_2(x) { return floor(x * 10000) / 100; }
function r_1(x) { return floor(x * 100) / 10; }


function rd(min, max) {
    return (random()) * (max - min) + min;
}

var round = Math.round;
var sqrt = Math.sqrt;
var PI = Math.PI;
var E = Math.E;

var deg = PI / 180.;
var rad = 180. / PI;

//  ver 1.0.01.003
function dim(v, u) {
    return sqrt(pow(u.x - v.x) + pow(u.y - v.y) + (def(u.z) ? pow(u.z - v.z) : 0));
}
function norm(v) {
    var x = v.x, y = v.y, z = v.z;
    var n = sqrt(x * x + y * y + z * z);

    if (n == 0) return { x: 0.1, y: 0.1, z: 0.1 };

    var invN = 1 / n;
    v.x *= invN;
    v.y *= invN;
    v.z *= invN;

    return v;
}
function sub(v, u) {
    return { x: u.x - v.x, y: u.y - v.y, z: u.z - v.z };
}
function dot(v, u) {
    return { x: u.x * v.x, y: u.y * v.y, z: u.z * v.z };
}
function cross(v, u) {
    var vx = v.x, vy = v.y, vz = v.z, x = u.x, y = u.y, z = u.z;
    var target = { x: 0, y: 0, z: 0 };

    target.x = ((y * vz) - (z * vy));
    target.y = ((z * vx) - (x * vz));
    target.z = ((x * vy) - (y * vx));

    return target;
}
 

(function (global) {
    var module =noise = {};

    function Grad(x, y, z) {
        this.x = x; this.y = y; this.z = z;
    }

    Grad.prototype.dot2 = function (x, y) {
        return this.x * x + this.y * y;
    };

    Grad.prototype.dot3 = function (x, y, z) {
        return this.x * x + this.y * y + this.z * z;
    };

    var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
                 new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
                 new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];

    var p = [151, 160, 137, 91, 90, 15,
    131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
    190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
    77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
    102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
    135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
    5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
    223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
    129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
    251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
    49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
    138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
    // To remove the need for index wrapping, double the permutation table length
    var perm = new Array(512);
    var gradP = new Array(512);

    // This isn't a very good seeding function, but it works ok. It supports 2^16
    // different seed values. Write something better if you need more seeds.
    module.seed = function (seed) {
        if (seed > 0 && seed < 1) {
            // Scale the seed out
            seed *= 65536;
        }

        seed = Math.floor(seed);
        if (seed < 256) {
            seed |= seed << 8;
        }

        for (var i = 0; i < 256; i++) {
            var v;
            if (i & 1) {
                v = p[i] ^ (seed & 255);
            } else {
                v = p[i] ^ ((seed >> 8) & 255);
            }

            perm[i] = perm[i + 256] = v;
            gradP[i] = gradP[i + 256] = grad3[v % 12];
        }
    };

    module.seed(0);

    /*
    for(var i=0; i<256; i++) {
      perm[i] = perm[i + 256] = p[i];
      gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
    }*/

    // Skewing and unskewing factors for 2, 3, and 4 dimensions
    var F2 = 0.5 * (Math.sqrt(3) - 1);
    var G2 = (3 - Math.sqrt(3)) / 6;

    var F3 = 1 / 3;
    var G3 = 1 / 6;

    // 2D simplex noise
    module.simplex2 = function (xin, yin) {
        var n0, n1, n2; // Noise contributions from the three corners
        // Skew the input space to determine which simplex cell we're in
        var s = (xin + yin) * F2; // Hairy factor for 2D
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var t = (i + j) * G2;
        var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
        var y0 = yin - j + t;
        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if (x0 > y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
            i1 = 1; j1 = 0;
        } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
            i1 = 0; j1 = 1;
        }
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
        var y2 = y0 - 1 + 2 * G2;
        // Work out the hashed gradient indices of the three simplex corners
        i &= 255;
        j &= 255;
        var gi0 = gradP[i + perm[j]];
        var gi1 = gradP[i + i1 + perm[j + j1]];
        var gi2 = gradP[i + 1 + perm[j + 1]];
        // Calculate the contribution from the three corners
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * gi0.dot2(x0, y0);  // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * gi1.dot2(x1, y1);
        }
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * gi2.dot2(x2, y2);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 70 * (n0 + n1 + n2);
    };

    // 3D simplex noise
    module.simplex3 = function (xin, yin, zin) {
        var n0, n1, n2, n3; // Noise contributions from the four corners

        // Skew the input space to determine which simplex cell we're in
        var s = (xin + yin + zin) * F3; // Hairy factor for 2D
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var k = Math.floor(zin + s);

        var t = (i + j + k) * G3;
        var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
        var y0 = yin - j + t;
        var z0 = zin - k + t;

        // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
        // Determine which simplex we are in.
        var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
        var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
        if (x0 >= y0) {
            if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
            else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
            else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
        } else {
            if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
            else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
            else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        }
        // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
        // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
        // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
        // c = 1/6.
        var x1 = x0 - i1 + G3; // Offsets for second corner
        var y1 = y0 - j1 + G3;
        var z1 = z0 - k1 + G3;

        var x2 = x0 - i2 + 2 * G3; // Offsets for third corner
        var y2 = y0 - j2 + 2 * G3;
        var z2 = z0 - k2 + 2 * G3;

        var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
        var y3 = y0 - 1 + 3 * G3;
        var z3 = z0 - 1 + 3 * G3;

        // Work out the hashed gradient indices of the four simplex corners
        i &= 255;
        j &= 255;
        k &= 255;
        var gi0 = gradP[i + perm[j + perm[k]]];
        var gi1 = gradP[i + i1 + perm[j + j1 + perm[k + k1]]];
        var gi2 = gradP[i + i2 + perm[j + j2 + perm[k + k2]]];
        var gi3 = gradP[i + 1 + perm[j + 1 + perm[k + 1]]];

        // Calculate the contribution from the four corners
        var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * gi0.dot3(x0, y0, z0);  // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
        }
        var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
        }
        var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0) {
            n3 = 0;
        } else {
            t3 *= t3;
            n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 32 * (n0 + n1 + n2 + n3);

    };

    // ##### Perlin noise stuff

    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function lerp(a, b, t) {
        return (1 - t) * a + t * b;
    }

    // 2D Perlin Noise
    module.perlin2 = function (x, y) {
        // Find unit grid cell containing point
        var X = Math.floor(x), Y = Math.floor(y);
        // Get relative xy coordinates of point within that cell
        x = x - X; y = y - Y;
        // Wrap the integer cells at 255 (smaller integer period can be introduced here)
        X = X & 255; Y = Y & 255;

        // Calculate noise contributions from each of the four corners
        var n00 = gradP[X + perm[Y]].dot2(x, y);
        var n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1);
        var n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y);
        var n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1);

        // Compute the fade curve value for x
        var u = fade(x);

        // Interpolate the four results
        return lerp(
            lerp(n00, n10, u),
            lerp(n01, n11, u),
           fade(y));
    };

    // 3D Perlin Noise
    module.perlin3 = function (x, y, z) {
        // Find unit grid cell containing point
        var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
        // Get relative xyz coordinates of point within that cell
        x = x - X; y = y - Y; z = z - Z;
        // Wrap the integer cells at 255 (smaller integer period can be introduced here)
        X = X & 255; Y = Y & 255; Z = Z & 255;

        // Calculate noise contributions from each of the eight corners
        var n000 = gradP[X + perm[Y + perm[Z]]].dot3(x, y, z);
        var n001 = gradP[X + perm[Y + perm[Z + 1]]].dot3(x, y, z - 1);
        var n010 = gradP[X + perm[Y + 1 + perm[Z]]].dot3(x, y - 1, z);
        var n011 = gradP[X + perm[Y + 1 + perm[Z + 1]]].dot3(x, y - 1, z - 1);
        var n100 = gradP[X + 1 + perm[Y + perm[Z]]].dot3(x - 1, y, z);
        var n101 = gradP[X + 1 + perm[Y + perm[Z + 1]]].dot3(x - 1, y, z - 1);
        var n110 = gradP[X + 1 + perm[Y + 1 + perm[Z]]].dot3(x - 1, y - 1, z);
        var n111 = gradP[X + 1 + perm[Y + 1 + perm[Z + 1]]].dot3(x - 1, y - 1, z - 1);

        // Compute the fade curve value for x, y, z
        var u = fade(x);
        var v = fade(y);
        var w = fade(z);

        // Interpolate
        return lerp(
            lerp(
              lerp(n000, n100, u),
              lerp(n001, n101, u), w),
            lerp(
              lerp(n010, n110, u),
              lerp(n011, n111, u), w),
           v);
    };

})(this);
 var process = function (pts1, pts2) {
            var n = pts1.length; var m = pts2.length; var r = max(n, m);
            var fy = function (i, n) { var f = function (ix) { return ceil((ix + 1) * (n / r)) - 1; }; var f2 = function (ix) { return ceil(ix * (n / r)); }; var fn = f(n); if (fn <= n) return f2(i); else f(i); };
            var p = { p1: [], p2: [] };
            for (var i = 1; i <= r; i++) { p.p1.push(fy(i, n) - 1); p.p2.push(fy(i, m) - 1); }
            return p;
        };

var GB = BABYLONX.GeometryBuilder;


		 BABYLONX.GeometryBuilder.EdgeRef = function (  ref) {
            
			var res = {r:ref , step:[]};
				for(var i = 0;i< ref.i.length;i++){
				res.step.push(i);
				}
				return res;
				
			}
		    BABYLONX.GeometryBuilder.Edge = function (geo, l, p, path ,repeat  ) {

            var path_pts = null;
              if (path && !path.points) {
                  if (!GB.cachePath) GB.cachePath = [];
                  if (path.d.indexOf('|') != -1) {
                      var key = path.d.split('|')[0];
                      path.d = path.d.split('|')[1];
                      GB.cachePath[key] = path.d;
                  }
                  if (path.d.indexOf('=') == 0) {
                      path.d = GB.cachePath[path.d.replace('=', '')];
                  }

                  path.d = def(path.d, "m 547.25,526.17859 c 0,0 -0.75,-28.06641 -21.25,-28.31641 -20.5,-0.25 -20.25,16.5 -20.25,16.5");
                  path.d2 = def(path.d2, "empty");
                  path.l = def(path.l, 0);
                  path.s = def(path.s, 100);

                  var key = JSON.stringify(path);

                  if (!GB.cache) GB.cache = [];

                  if (GB.cache[key]) path_pts = GB.cache[key];

                  else {

                      path_pts = GB.GetPoints({
                          path: path.d, density: path.dn,
                          push: def(path.p, function (r, n, e) {

                              r.push({ x: (-n.x + 526) / path.s, y: 0.0, z: (n.y - 526) / path.s });
                              if (e) { return r; }

                          }), pointLength: path.c, inLine: path.l
                      });


                      if (path.d2 != "empty") {

                          var pathd2 = GB.GetPoints({
                              path: path.d2,
                              push: def(path.p, function (r, n, e) {
                                  if (e) { return r; }
                                  r.push({ x: (-n.x + 526) / path.s, y: 0.0, z: (n.y - 526) / path.s });
                              }), pointLength: path.c, inLine: path.l
                          });


                          for (var i_ppt in path_pts) {

                              var endijloop = false;
                              for (var ij = 0; !endijloop && ij < pathd2.length - 1; ij++) {
                                  if (pathd2[ij].x < path_pts[i_ppt].x && pathd2[0].x > path_pts[i_ppt].x) {
                                      endijloop = true;
                                      path_pts[i_ppt].y = (pathd2[ij + 1].z - pathd2[ij].z) *
                                          ((pathd2[ij + 1].x - pathd2[ij].x) / (path_pts[i_ppt].x - pathd2[ij].z)) + pathd2[ij].z - path_pts[i_ppt].z;
                                  }
                              }

                          }


                      }


                      GB.cache[key] = path_pts;

                  }

                  s = path_pts.length;

              }
              else if (path  && path.points) {
                  path_pts = path.points;
              }
            var sylc = { i: [], f: [], isCylc: true, std: ind };
            var std = ind;

            var al = (2. * Math.PI) / (s - 1);
            var s = path_pts.length;
            for (var i = 0; i < s; i++) {
                var al1 = i * al;
                var pot = { x: 10. * sin(al1), y: 0., z: 10. * cos(al1) };

                if (path && path_pts && path_pts[i])
                    pot = { x: path_pts[i].x, y: path_pts[i].y, z: path_pts[i].z };

                var pot1 = r_y(pot, def(p.ry, 0.) * Math.PI / 180., def(p.ce, { x: 0, y: 0, z: 0 }));
                var pot2 = r_x(pot1, def(p.rx, 0.) * Math.PI / 180., def(p.ce, { x: 0, y: 0, z: 0 }));
                var pot3 = r_z(pot2, def(p.rz, 0.) * Math.PI / 180., def(p.ce, { x: 0, y: 0, z: 0 }));

                pot3.y *= def(p.sy, 1.);
                pot3.z *= def(p.sz, 1.);
                pot3.x *= def(p.sx, 1.);
                pot3.y *= def(p.sa, 1.);
                pot3.z *= def(p.sa, 1.);
                pot3.x *= def(p.sa, 1.);

                if (p && p.y && typeof p.y == "function") pot3.y += def(p.y(pot3), 0.); else pot3.y += def(p.y, 0.);
                if (p && p.x && typeof p.x == "function") pot3.x += def(p.x(pot3), 0.); else pot3.x += def(p.x, 0.);
                if (p && p.z && typeof p.z == "function") pot3.z += def(p.z(pot3), 0.); else pot3.z += def(p.z, 0.);



                pot3 = r_y(pot, def(p.mry, 0.) * Math.PI / 180., def(p.mce, { x: 0, y: 0, z: 0 }));
                pot3 = r_x(pot1, def(p.mrx, 0.) * Math.PI / 180., def(p.mce, { x: 0, y: 0, z: 0 }));
                pot3 = r_z(pot2, def(p.mrz, 0.) * Math.PI / 180., def(p.mce, { x: 0, y: 0, z: 0 }));

                var u = path.uvv ? path.uvv(i, s, pot3) : i / s;
                if (u.x)
                    geo.uvs.push(u.x, u.y);
                else geo.uvs.push(u, l);

                if (p.custom) pot3 = p.custom(pot3, i,s);

                pot3.x = -1. * pot3.x;

                GB.PushVertex(geo, pot3);
                sylc.i[i] = ind;
                ind++;


            }

			 if (p.reverse)  sylc.i =  sylc.i.reverse()  ;



			if(repeat && repeat > 1){
			 var rep = [BABYLONX.GeometryBuilder.EdgeRef( sylc)];
			 for(var i = 1;i<repeat;i++){
			     rep.push( BABYLONX.GeometryBuilder.Edge(geo, l, p, path)[0]);
			 }

			 return rep;
			}

            return [BABYLONX.GeometryBuilder.EdgeRef( sylc)];

        };

      var ptts = [];
		

        BABYLONX.GeometryBuilder.InitEdgePaths = function (geo, arr) {
            var ptts = arr;


            GB.cachePath = null; GB.cache = null; var uv_plan = function (i, s, pp) { return { x: (pp.z - 20) * 0.01, y: (pp.y - 20) * 0.01 }; };

            for (var ij = 0; ij < ptts.length; ij++) { lp = ij; ref = 0; ref = BABYLONX.GeometryBuilder.Edge(geo,  1. , { rx: 0, sa: 1 }, { s: 1, l: 1, close: 1, c: 10, d: ptts[lp] }); }
        }
 
  BABYLONX.GeometryBuilder.Connect  = function (geo, s, r , f ) {
            
			r = r.r;
           
            if (r.length == 1) {

                r = r[0];
                if (r.step) {
                    var i = { i: [], f: [], isCylc: true, std: r.std };
                    for (var j in r.step) { i.i.push(r.r.i[r.step[j]]); }
                    r = i;
                }

            } 

            var sylc = { i: [], f: [], isCylc: true, std: ind };
            var std = ind;

             
                for (var j in s.step) { sylc.i.push(s.r.i[s.step[j]]); }
                sylc.std = s.r.std;
                console.log(JSON.stringify(sylc));
             

            if (r.isCylc) {
                var p1 = [];
                for (var i = 0; i < sylc.i.length; i++) {
                    p1.push(sylc.i[i]);
                }
                var hlp = process(p1, r.i);

                for (var i = 0; i < hlp.p1.length - 1; i++) {
                    GB.MakeFace(geo, [p1[hlp.p1[i]], r.i[hlp.p2[i]], p1[hlp.p1[i + 1]], r.i[hlp.p2[i + 1]]], { flip: f, faceUVMap: "0123" });
                    sylc.f[geo.faces.length];
                } 
                
            }
 
        };
       
        var ind = 0;



     var mix = function (a,b ,n) {  
 
	if(n ){
 for (var bi in b) { 
          
      eval(' a.' + bi + '=def(b.' + bi + ',a.' + bi + ');'); 

       } 
 
}
else{
        for (var bi in b) { 
          
      eval('if(a.' + bi + '!= null && a.' + bi + '!= undefined)a.' + bi + '=def(b.' + bi + ',a.' + bi + ');'); 

       } 
  
}

      return a; 
    };

   
  BABYLONX.GeometryBuilder.Part = function(setting,external){
          this.Setting = def( setting,{}); 
          this.ExternalPush =external;
    };

   

  BABYLONX.GeometryBuilder.Part.prototype = {
         Creator : function(setting){},
   
      Create : function(fn){ this.Creator = fn; return this;  },
       
  New : function(setting,custom,param){
	var th = this;
	if(custom)		
		this.Creator(mix(setting,th.Setting),
			function(p){return custom(th.PushVertex(p,mix(setting,th.Setting)),mix(setting,th.Setting),param);});
	else 
		this.Creator(mix(setting,this.Setting),this.PushVertex); return this;},
    
    PushVertex: function(p){ return p;},
       

  ExternalPush: function(p){ return p;},
         Custom : function(fn){ this.PushVertex = fn; return this;},
         Setting : {}
     };
	 
	 
	 
	 
	     var mix = function (a,b ,n) {  
 
	if(n ){
 for (var bi in b) { 
          
      eval(' a.' + bi + '=def(b.' + bi + ',a.' + bi + ');'); 

       } 
 
}
else{
        for (var bi in b) { 
          
      eval('if(a.' + bi + '!= null && a.' + bi + '!= undefined)a.' + bi + '=def(b.' + bi + ',a.' + bi + ');'); 

       } 
  
}

      return a; 
    };

   
  BABYLONX.GeometryBuilder.Part = function(setting,external){
          this.Setting = def( setting,{}); 
          this.ExternalPush =external;
    };

   

  BABYLONX.GeometryBuilder.Part.prototype = {
         Creator : function(setting){},
   
      Create : function(fn){ this.Creator = fn; return this;  },
       
  New : function(setting,custom,param){
	var th = this;
	if(custom)		
		this.Creator(mix(setting,th.Setting),
			function(p){return custom(th.PushVertex(p,mix(setting,th.Setting)),mix(setting,th.Setting),param);});
	else 
		this.Creator(mix(setting,this.Setting),this.PushVertex); return this;},
    
    PushVertex: function(p){ return p;},
       

  ExternalPush: function(p){ return p;},
         Custom : function(fn){ this.PushVertex = fn; return this;},
         Setting : {}
     };
	 
	 
	 
	 
	 
	     BABYLONX.GeometryBuilder.Rims = function(){
    
	  this.edgs = new Array();
	  this.edgsNames = new Array();
	  this.Rims_Points = new Array();
	  this.Rim_Index = 0;
      return this;
    };
	
  
BABYLONX.GeometryBuilder.h_p = function (geo, lpt, r) {
   if(!geo.helpers ) geo.helpers = [];
   
   geo.helpers.push({t:'point', pt:lpt,r:r});
};


BABYLONX.GeometryBuilder.showHelpers = function (geo){
	
	for(var i in geo.helpers){
		
		i = geo.helpers[i];
		if(i.t=='point'){
			var lpt = i.pt;
			 var r = i.r*10.;
    GB.MakeFace(geo, [{ x: lpt.x - 1.1 * r, y: lpt.y, z: lpt.z - 0.1 * r }, { x: lpt.x + 1.1 * r, y: lpt.y, z: lpt.z - 0.1 * r }, { x: lpt.x - 1.1 * r, y: lpt.y, z: lpt.z + 0.1 * r }, { x: lpt.x + 1.1 * r, y: lpt.y, z: lpt.z + 0.1 * r }], {
        flip: true,
        faceUVMap: "0123"
    });
    GB.MakeFace(geo, [{ x: lpt.x - .1 * r, y: lpt.y - 1.1 * r, z: lpt.z }, { x: lpt.x + .1 * r, y: lpt.y - 1.1 * r, z: lpt.z }, { x: lpt.x - 0.1 * r, y: lpt.y + 1.1 * r, z: lpt.z }, { x: lpt.x + 0.1 * r, y: lpt.y + 1.1 * r, z: lpt.z }], {
        flip: true,
        faceUVMap: "0123"
    });

    GB.MakeFace(geo, [{ x: lpt.x, y: lpt.y - 0.1 * r, z: lpt.z - 1.1 * r }, { x: lpt.x, y: lpt.y - 0.1 * r, z: lpt.z + 1.1 * r }, { x: lpt.x, y: lpt.y + 0.1 * r, z: lpt.z - 1.1 * r }, { x: lpt.x, y: lpt.y + 0.1 * r, z: lpt.z + 1.1 * r }], {
        flip: true,
        faceUVMap: "0123"
    });
			
		}
		
	}
	
};


 
function r_lasp(p,tar) { if(tar.x == 0 ) tar.x += 0.00001;
if(tar.y == 0 ) tar.y += 0.00001;
if(tar.z == 0 ) tar.z += 0.00001;


    var t1 = { x: tar.x, y: tar.y, z: tar.z };
    var t2 = { x: tar.x, y: tar.y, z: tar.z };

    t1 = (t1);

    var a = atan(t1.x / t1.z);

    t2 = (r_y(t2, a));
    var b = atan(t2.z / t2.y);

    p = r_x(p, 90 * deg);
    var ang1 = 0,ang2 = 0,ang3 = 0;
     
       ang1 =  -1 * (90 * deg - b);
      ang2 = -a;

    
    
    
   
    p = r_x(p,ang1);
    p = r_y(p,ang2);
    p = r_z(p,ang3*180.*deg);
    



    return p; 
}

var curr_uv_map = {us:0,vs:0,scale:1.0};

function uvMap(us,vs,scale){
  curr_uv_map = {us:us,vs:vs,scale:scale};	
}

function setUvMap(s){

      return { u:curr_uv_map.us+curr_uv_map.scale*s.u, v: curr_uv_map.vs+curr_uv_map.scale*s.v };
	
}

    BABYLONX.GeometryBuilder.Rims.prototype = {
      edgs:null, 
      edgsNames:null, 
      Rim_Index :0,
	  uvMap : {us:0,vs:0,scale:1.0},
       Rims_Points: null,
       Rim_Custom : function(p){ return p;},
       Custom : function(fun){ var th = this;this.Rim_Custom = fun; return th;},
	   Rim_UV : function(p,i,s,u,v){
		   
		    return {u:def(u,0)+0.01,v:def(v,0)+0.01};
	   }
	   , UV : function(fun){
		   
		    var th = this;this.Rim_UV = fun; return th;
	   }
	   ,UVMap:function(us,vs,scale){
		   
		      var th = this;th.uvMap = {us:us,vs:vs,scale:scale}; return th;
	   },
	   RimPart : function(geo,count,point,uv,repeat){
		   var th = this; 
		    
		   if(!point && count.count){
			   
			   point = count.point;
			   uv = count.uv;
			   repeat = count.repeat;
			   notEnd = true;
			   count = count.count;			
			   th.PushRim(geo,count );			   
		   }
		   else{
			    th.PushRim(geo,count,point,uv,repeat,true);				   
		   }
		   return th;
			
	   },
	   EndRimParts : function(geo  ){
		   var th = this; 
		    th.PushRim(geo,0,function(p){return p;});			   
		    
		   return th;
			
	   },
       PushRim : function(geo,count,point,uv,repeat,notEnd){
		   var name = null;
		   if(!point && count.count){
			   name = count.name;
			   point = count.point;
			   uv = count.uv;
			   repeat = count.repeat;
			   notEnd = count.notEnd;
			   count = count.count;	 
		   }
		   
          var th = this; 
		  if(typeof(uv)=='function')
			 th = th.UV(uv);
              
         repeat = def(repeat,1); 
        
         if(!th.Rims_Points[th.Rim_Index]) th.Rims_Points[th.Rim_Index] = [];
          if(count.length) th.Rims_Points[th.Rim_Index] = count;
          else if(count>0){ 
             for(var i = 0;i<  count;i++){ 
                th.Rims_Points[th.Rim_Index].push(th.Rim_Custom(point({x:0,y:0,z:0} ,i ,th.Rim_Index ,  i/count))); 
             }
          }
          if(!notEnd)
          {
             th.edgs[th.Rim_Index] = GB.Edge( geo ,  typeof(uv)=='function' ? 0.0 :uv ,{ custom:function(p,i,s){
				 var uv = th.Rim_UV(p,i,s-1,geo.uvs[geo.uvs.length-3],geo.uvs[geo.uvs.length-4]);
				 geo.uvs[geo.uvs.length-1] = curr_uv_map.us+curr_uv_map.scale*( th.uvMap.us+th.uvMap.scale*uv.u); geo.uvs[geo.uvs.length-2] =curr_uv_map.vs+curr_uv_map.scale*( th.uvMap.vs+th.uvMap.scale*uv.v );  
				 return p;
				 } } , {points:th.Rims_Points[th.Rim_Index]},repeat);
             th.Rim_Index++; 
          }
		  
		   if(  name){
			   
			  	th.edgsNames[th.Rim_Index-1]  = name;		   
		   } 
		  

          return th;
       }, 
       Connect : function(geo,a,b,f,c,d){ 
         var th = this;
		 
		 if(typeof(a) == 'string'){
			 var am = a;
			 for(var ls in th.edgs){
				 if(th.edgsNames[ls]  == am)
					 a = ls.valueOf()*1;
			 } 
		 }
		 
		 if(typeof(b) == 'string'){
			 var bm = b;
			 for(var ls in th.edgs){
				 if(th.edgsNames[ls]  == bm)
					 b = ls.valueOf()*1;
			 } 
		 }
		 
           try{  if(th.Rim_Index > 1 || th.edgs[0].length > 0){
           a = def(a,th.Rim_Index-1);
           b = def(b,th.Rim_Index-2);
           c = def(c,0);
           d = def(d,(a==b)?1:0); 
            GB.Connect( geo, a==-1 ?  th.edgs[th.Rim_Index-1][c]:  th.edgs[a][c], b ==-1 ?  th.edgs[th.Rim_Index-1][d]:    th.edgs[b][d],f);  
           } }catch(e){}
           return th; 
       }

    };
	
 
  
function p_ts(p,ts){
	
	  var _ts = def(ts ,{});
        p.x *= def(_ts.sx,1.0);
        p.y *= def(_ts.sy,1.0);
        p.z *= def(_ts.sz,1.0);
        p.x *= def(_ts.sa,1.0);
        p.y *= def(_ts.sa,1.0);
        p.z *= def(_ts.sa,1.0);

        _ts.rt = def(_ts.rt,'xyz'); 
        for(var k=0;k<3;k++){
            if(_ts.rt[k] == 'x')
            p = r_x(p,def(_ts.rx,0),def(_ts.ce,{x:0,y:0,z:0}));
            else if(_ts.rt[k] == 'y')
            p = r_y(p,def(_ts.ry,0),def(_ts.ce,{x:0,y:0,z:0}));
            else if(_ts.rt[k] == 'z')
            p = r_z(p,def(_ts.rz,0),def(_ts.ce,{x:0,y:0,z:0}));
        }        

        p.x += def(_ts.mx,0.0);
        p.y += def(_ts.my,0.0);
        p.z += def(_ts.mz,0.0);  

        _ts.rt2 = def(_ts.rt2,'xyz'); 
        for(var k=0;k<3;k++){
            if(_ts.rt2[k] == 'x')
            p = r_x(p,def(_ts.rx2,0),def(_ts.ce2,{x:0,y:0,z:0}));
            else if(_ts.rt2[k] == 'y')
            p = r_y(p,def(_ts.ry2,0),def(_ts.ce2,{x:0,y:0,z:0}));
            else if(_ts.rt2[k] == 'z')
            p = r_z(p,def(_ts.rz2,0),def(_ts.ce2,{x:0,y:0,z:0}));
        }  

        return p;
}
  
  
  function r_la_spPCAD(p,s,e,y,sp) { 

    var tar =  {
            x:e.x - s.x,
            y:e.y - s.y,
            z:e.z - s.z  
            };

        if(tar.x ==0 && tar.z == 0 ) { 
        
         p = r_y(p,def(y,0)); 

        if(tar.y>0)
        {
         p = r_x(p,180.*deg);
         p = r_y(p,180.*deg);  
        } 

         p.x += sp.x;
         p.y += sp.y;
         p.z += sp.z;

        return p;
    }

    if(tar.x == 0 ) tar.x += 0.000001;
    if(tar.y == 0 ) tar.y += 0.000001;
    if(tar.z == 0 ) tar.z += 0.000001;

    var t1 = { x: -tar.x, y: tar.y, z: tar.z };
    var t2 = { x: -tar.x, y: tar.y, z: tar.z };

    t1 = (t1);
    
    var a = atan(t1.x / t1.z);

    t2 = (r_y(t2, a));
    var b = atan(t2.z / t2.y);

    p = r_x(p, (tar.y>0?-1:1)*90 * deg);
     
      var ang1 = 0,ang2 = 0,ang3 = 0;
      ang1 =  -1 * (90 * deg - b);
      ang2 = -a; 
   
        p = r_x(p,ang1);
        p = r_y(p,ang2);  

      p.x += -sp.x ;
      p.y += sp.y ;
      p.z += sp.z ;

    return p; 
}



 
