// Permite importar archivos YAML (resueltos por @rollup/plugin-yaml en build).
declare module "*.yml" {
	const value: any;
	export default value;
}
declare module "*.yaml" {
	const value: any;
	export default value;
}
